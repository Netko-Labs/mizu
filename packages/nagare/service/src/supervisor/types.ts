export interface SupervisorHandle {
  /** Stop the loop; resolves after the in-flight pass completes. */
  stop(): Promise<void>
}

export interface SupervisorOptions {
  intervalMs?: number
}

export interface RestartTracker {
  attempts: number
  nextAttemptAt: number
  misses: number
  /** Consecutive reconcile passes where the TCP liveness probe failed */
  probeFailures: number
  exhausted: boolean
}

export interface SupervisorState {
  trackers: Map<string, RestartTracker>
}

export type EntityKind = 'service' | 'database'

export interface EntityRecord {
  kind: EntityKind
  id: string
  status: string
  containerId: string
  /** Container-side TCP port the liveness probe dials; null = don't probe */
  probePort: number | null
}
