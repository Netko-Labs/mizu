/**
 * One reconcile pass: compare desired state (DB status columns = user intent)
 * against actual state (`container ls`) and heal the difference. This is
 * mizu's replacement for Docker restart policies — the daemon owns restarts.
 */

import { createLogger } from '@mizu/logger'
import { databaseTable, serviceTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq, isNotNull } from 'drizzle-orm'
import { deployDatabase } from '../mutations/databases/deploy-database'
import { deployService } from '../mutations/services/deploy-service'
import { type ContainerState, listContainers, startContainer, stopContainer } from '../runtime'
import { BACKOFF_BASE_MS, BACKOFF_CAP_MS, MAX_RESTART_ATTEMPTS, MISS_THRESHOLD } from './constants'
import type { EntityRecord, RestartTracker, SupervisorState } from './types'

const logger = createLogger('supervisor')

/** Statuses that mean "this should be up" (user intent) */
const WANTS_RUNNING = new Set(['running', 'starting'])
/** Statuses that mean "this should be down" (user intent) */
const WANTS_STOPPED = new Set(['stopped', 'created'])
/** Transitional statuses — a mutation is mid-flight, leave alone */
const TRANSITIONAL = new Set(['building', 'stopping'])

function getTracker(state: SupervisorState, entityId: string): RestartTracker {
  let tracker = state.trackers.get(entityId)
  if (!tracker) {
    tracker = { attempts: 0, nextAttemptAt: 0, misses: 0, exhausted: false }
    state.trackers.set(entityId, tracker)
  }
  return tracker
}

async function setEntityStatus(entity: EntityRecord, status: string): Promise<void> {
  if (entity.kind === 'service') {
    await db
      .update(serviceTable)
      .set({ status: status as (typeof serviceTable.$inferSelect)['status'] })
      .where(eq(serviceTable.id, entity.id))
  } else {
    await db
      .update(databaseTable)
      .set({ status: status as (typeof databaseTable.$inferSelect)['status'] })
      .where(eq(databaseTable.id, entity.id))
  }
}

async function loadDesiredState(): Promise<EntityRecord[]> {
  const [services, databases] = await Promise.all([
    db
      .select({
        id: serviceTable.id,
        status: serviceTable.status,
        containerId: serviceTable.containerId,
      })
      .from(serviceTable)
      .where(isNotNull(serviceTable.containerId)),
    db
      .select({
        id: databaseTable.id,
        status: databaseTable.status,
        containerId: databaseTable.containerId,
      })
      .from(databaseTable)
      .where(isNotNull(databaseTable.containerId)),
  ])

  return [
    ...services.map((s) => ({
      kind: 'service' as const,
      id: s.id,
      status: s.status,
      containerId: s.containerId as string,
    })),
    ...databases.map((d) => ({
      kind: 'database' as const,
      id: d.id,
      status: d.status,
      containerId: d.containerId as string,
    })),
  ]
}

async function healCrashed(entity: EntityRecord, state: SupervisorState): Promise<void> {
  const tracker = getTracker(state, entity.id)
  if (tracker.exhausted || Date.now() < tracker.nextAttemptAt) return

  tracker.attempts += 1
  tracker.nextAttemptAt =
    Date.now() + Math.min(BACKOFF_BASE_MS * 2 ** (tracker.attempts - 1), BACKOFF_CAP_MS)

  logger.warn(
    { entity: entity.id, kind: entity.kind, attempt: tracker.attempts },
    'Container down but should be running — restarting',
  )

  try {
    await startContainer(entity.containerId)
    await setEntityStatus(entity, 'running')
    tracker.attempts = 0
    tracker.nextAttemptAt = 0
  } catch (error) {
    logger.error(
      { entity: entity.id, attempt: tracker.attempts, error: String(error) },
      'Restart attempt failed',
    )
    if (tracker.attempts >= MAX_RESTART_ATTEMPTS) {
      tracker.exhausted = true
      await setEntityStatus(entity, 'error')
      logger.error({ entity: entity.id }, 'Restart attempts exhausted — marked error')
    }
  }
}

async function healMissing(entity: EntityRecord, state: SupervisorState): Promise<void> {
  const tracker = getTracker(state, entity.id)
  tracker.misses += 1
  if (tracker.misses < MISS_THRESHOLD) return
  if (tracker.exhausted || Date.now() < tracker.nextAttemptAt) return

  tracker.attempts += 1
  tracker.misses = 0
  tracker.nextAttemptAt =
    Date.now() + Math.min(BACKOFF_BASE_MS * 2 ** (tracker.attempts - 1), BACKOFF_CAP_MS)

  logger.warn(
    { entity: entity.id, kind: entity.kind, attempt: tracker.attempts },
    'Container missing but should be running — re-deploying',
  )

  try {
    if (entity.kind === 'service') {
      const result = await deployService(entity.id)
      if (!result.success) throw new Error(result.error ?? 'deploy failed')
    } else {
      await deployDatabase(entity.id)
    }
    tracker.attempts = 0
    tracker.nextAttemptAt = 0
  } catch (error) {
    logger.error({ entity: entity.id, error: String(error) }, 'Re-deploy attempt failed')
    if (tracker.attempts >= MAX_RESTART_ATTEMPTS) {
      tracker.exhausted = true
      await setEntityStatus(entity, 'error')
      logger.error({ entity: entity.id }, 'Re-deploy attempts exhausted — marked error')
    }
  }
}

/**
 * Run one reconcile pass. Errors are contained per entity so one bad
 * container never blocks the rest.
 */
export async function reconcileOnce(state: SupervisorState): Promise<void> {
  const [entities, containers] = await Promise.all([loadDesiredState(), listContainers()])
  const actual = new Map<string, ContainerState>(containers.map((c) => [c.id, c.state]))

  for (const entity of entities) {
    const tracker = state.trackers.get(entity.id)
    const actualState = actual.get(entity.containerId)

    try {
      if (TRANSITIONAL.has(entity.status)) continue

      // A redeploy/user action moved the entity out of error — reset tracking
      if (tracker?.exhausted && entity.status !== 'error') {
        state.trackers.delete(entity.id)
      }

      if (WANTS_RUNNING.has(entity.status)) {
        if (actualState === 'running') {
          if (tracker) state.trackers.delete(entity.id)
        } else if (actualState === undefined) {
          await healMissing(entity, state)
        } else {
          await healCrashed(entity, state)
        }
      } else if (WANTS_STOPPED.has(entity.status) && actualState === 'running') {
        // Enforce user intent declaratively — Stop must mean stopped
        logger.warn({ entity: entity.id }, 'Container running against user intent — stopping')
        await stopContainer(entity.containerId)
      }
    } catch (error) {
      logger.error({ entity: entity.id, error: String(error) }, 'Reconcile action failed')
    }
  }
}
