/**
 * One reconcile pass: compare desired state (DB status columns = user intent)
 * against actual state (`container ls`) and heal the difference. This is
 * mizu's replacement for Docker restart policies — the daemon owns restarts.
 */

import { createLogger } from '@mizu/logger'
import { databaseTable, serviceConnectionTable, serviceTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq, isNotNull } from 'drizzle-orm'
import { syncIngress } from '../ingress'
import { DEFAULT_PORTS, deployDatabase } from '../mutations/databases/deploy-database'
import { deployService } from '../mutations/services/deploy-service'
import {
  type ContainerStatus,
  forceRemoveContainer,
  listContainers,
  startContainer,
  stopContainer,
} from '../runtime'
import {
  BACKOFF_BASE_MS,
  BACKOFF_CAP_MS,
  MAX_RESTART_ATTEMPTS,
  MISS_THRESHOLD,
  PROBE_FAILURE_THRESHOLD,
  PROBE_GRACE_MS,
  PROBE_TIMEOUT_MS,
} from './constants'
import { probeTcp } from './probe'
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
    tracker = { attempts: 0, nextAttemptAt: 0, misses: 0, probeFailures: 0, exhausted: false }
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

/** First declared TCP port — what the liveness probe dials. */
function serviceProbePort(ports: unknown): number | null {
  const list = (ports as Array<{ container?: number; protocol?: string }> | null) ?? []
  return list.find((p) => p.container && (p.protocol ?? 'tcp') === 'tcp')?.container ?? null
}

async function loadDesiredState(): Promise<EntityRecord[]> {
  const [services, databases] = await Promise.all([
    db
      .select({
        id: serviceTable.id,
        status: serviceTable.status,
        containerId: serviceTable.containerId,
        ports: serviceTable.ports,
      })
      .from(serviceTable)
      .where(isNotNull(serviceTable.containerId)),
    db
      .select({
        id: databaseTable.id,
        status: databaseTable.status,
        containerId: databaseTable.containerId,
        type: databaseTable.type,
        port: databaseTable.port,
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
      probePort: serviceProbePort(s.ports),
    })),
    ...databases.map((d) => ({
      kind: 'database' as const,
      id: d.id,
      status: d.status,
      containerId: d.containerId as string,
      probePort: d.port ?? DEFAULT_PORTS[d.type],
    })),
  ]
}

/**
 * Connection env vars hold target container IPs, and a healed container comes
 * back with a NEW IP — re-deploy dependents so their wiring stays live.
 * One level deep: service→service IP chains are rare enough for v0.1.
 */
async function redeployDependents(entity: EntityRecord): Promise<void> {
  const targetColumn =
    entity.kind === 'service'
      ? serviceConnectionTable.toServiceId
      : serviceConnectionTable.toDatabaseId

  const dependents = await db
    .select({ fromServiceId: serviceConnectionTable.fromServiceId })
    .from(serviceConnectionTable)
    .where(eq(targetColumn, entity.id))

  for (const fromServiceId of new Set(dependents.map((d) => d.fromServiceId))) {
    const [dependent] = await db
      .select({ status: serviceTable.status })
      .from(serviceTable)
      .where(eq(serviceTable.id, fromServiceId))
    if (!dependent || !WANTS_RUNNING.has(dependent.status)) continue

    logger.info(
      { dependent: fromServiceId, target: entity.id },
      'Target came back with a new IP — re-deploying dependent service',
    )
    try {
      const result = await deployService(fromServiceId, { trigger: 'supervisor' })
      if (!result.success) throw new Error(result.error ?? 'deploy failed')
    } catch (error) {
      logger.error({ dependent: fromServiceId, error: String(error) }, 'Dependent re-deploy failed')
    }
  }
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
    await redeployDependents(entity)
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
      const result = await deployService(entity.id, { trigger: 'supervisor' })
      if (!result.success) throw new Error(result.error ?? 'deploy failed')
    } else {
      await deployDatabase(entity.id)
    }
    tracker.attempts = 0
    tracker.nextAttemptAt = 0
    await redeployDependents(entity)
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
 * The runtime reports a wedged container VM as "running", so "running" alone
 * isn't liveness — recycle the container (force-remove + redeploy) after the
 * TCP probe fails enough consecutive passes.
 */
async function healUnresponsive(entity: EntityRecord, state: SupervisorState): Promise<void> {
  const tracker = getTracker(state, entity.id)
  if (tracker.exhausted || Date.now() < tracker.nextAttemptAt) return

  tracker.attempts += 1
  tracker.probeFailures = 0
  tracker.nextAttemptAt =
    Date.now() + Math.min(BACKOFF_BASE_MS * 2 ** (tracker.attempts - 1), BACKOFF_CAP_MS)

  logger.warn(
    { entity: entity.id, kind: entity.kind, port: entity.probePort, attempt: tracker.attempts },
    'Container reports running but is not accepting connections — recycling',
  )

  try {
    await forceRemoveContainer(entity.containerId)
    if (entity.kind === 'service') {
      const result = await deployService(entity.id, { trigger: 'supervisor' })
      if (!result.success) throw new Error(result.error ?? 'deploy failed')
    } else {
      await deployDatabase(entity.id)
    }
    tracker.attempts = 0
    tracker.nextAttemptAt = 0
    await redeployDependents(entity)
  } catch (error) {
    logger.error({ entity: entity.id, error: String(error) }, 'Recycle attempt failed')
    if (tracker.attempts >= MAX_RESTART_ATTEMPTS) {
      tracker.exhausted = true
      await setEntityStatus(entity, 'error')
      logger.error({ entity: entity.id }, 'Recycle attempts exhausted — marked error')
    }
  }
}

/**
 * Liveness for a container the runtime says is running. True = healthy or not
 * probeable (no TCP port, no IP yet, or still inside the boot grace window).
 */
async function isResponsive(entity: EntityRecord, container: ContainerStatus): Promise<boolean> {
  if (!entity.probePort || !container.ipv4Address) return true
  const startedAt = container.startedAt ? Date.parse(container.startedAt) : Number.NaN
  if (Number.isFinite(startedAt) && Date.now() - startedAt < PROBE_GRACE_MS) return true
  return probeTcp(container.ipv4Address, entity.probePort, PROBE_TIMEOUT_MS)
}

/**
 * Run one reconcile pass. Errors are contained per entity so one bad
 * container never blocks the rest.
 */
export async function reconcileOnce(state: SupervisorState): Promise<void> {
  const [entities, containers] = await Promise.all([loadDesiredState(), listContainers()])
  const actual = new Map<string, ContainerStatus>(containers.map((c) => [c.id, c]))

  for (const entity of entities) {
    const tracker = state.trackers.get(entity.id)
    const container = actual.get(entity.containerId)
    const actualState = container?.state

    try {
      if (TRANSITIONAL.has(entity.status)) continue

      // A redeploy/user action moved the entity out of error — reset tracking
      if (tracker?.exhausted && entity.status !== 'error') {
        state.trackers.delete(entity.id)
      }

      if (WANTS_RUNNING.has(entity.status)) {
        if (actualState === 'running' && container) {
          if (await isResponsive(entity, container)) {
            if (tracker) state.trackers.delete(entity.id)
          } else {
            const t = getTracker(state, entity.id)
            t.probeFailures += 1
            logger.warn(
              { entity: entity.id, port: entity.probePort, failures: t.probeFailures },
              'Liveness probe failed',
            )
            if (t.probeFailures >= PROBE_FAILURE_THRESHOLD) {
              await healUnresponsive(entity, state)
            }
          }
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

  // Ingress rides the same loop: routes follow status, caddy crashes heal here
  await syncIngress().catch((error) => {
    logger.warn({ error: String(error) }, 'Ingress sync failed during reconcile')
  })
}
