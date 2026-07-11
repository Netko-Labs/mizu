/**
 * The nagare supervisor: a self-scheduling reconcile loop that owns restart
 * policies and status healing (Apple's `container` runtime has neither
 * restart policies nor an events API — the daemon is the orchestrator).
 */

import { createLogger } from '@mizu/logger'
import { RECONCILE_INTERVAL_MS } from './constants'
import { reconcileOnce } from './reconcile'
import type { SupervisorHandle, SupervisorOptions, SupervisorState } from './types'

const logger = createLogger('supervisor')

export function startSupervisor(options?: SupervisorOptions): SupervisorHandle {
  const intervalMs = options?.intervalMs ?? RECONCILE_INTERVAL_MS
  const state: SupervisorState = { trackers: new Map() }

  let stopping = false
  let timer: ReturnType<typeof setTimeout> | null = null
  let inFlight: Promise<void> = Promise.resolve()

  const schedule = () => {
    if (stopping) return
    timer = setTimeout(() => {
      inFlight = reconcileOnce(state)
        .catch((error) => {
          logger.error({ error: String(error) }, 'Reconcile pass failed')
        })
        .finally(schedule)
    }, intervalMs)
  }

  logger.info({ intervalMs }, '🛟 supervisor watching the flow')
  // First pass soon after boot (containers may need healing after a restart)
  timer = setTimeout(() => {
    inFlight = reconcileOnce(state)
      .catch((error) => {
        logger.error({ error: String(error) }, 'Reconcile pass failed')
      })
      .finally(schedule)
  }, 2_000)

  return {
    async stop() {
      stopping = true
      if (timer) clearTimeout(timer)
      await inFlight
      logger.info('supervisor stopped')
    },
  }
}
