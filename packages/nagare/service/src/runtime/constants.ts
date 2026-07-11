/** The Apple container binary (overridable for tests/paths) */
export const CONTAINER_BIN = process.env.CONTAINER_BIN ?? 'container'

/** Default timeout for runtime CLI calls */
export const CLI_DEFAULT_TIMEOUT_MS = 60_000

/** Image pulls can be slow on first fetch */
export const PULL_TIMEOUT_MS = 15 * 60_000

/** Seconds `container stop` waits before killing */
export const DEFAULT_STOP_TIMEOUT_SECS = 10

/**
 * Local DNS domain served to containers and the host
 * (provisioned once via `sudo container system dns create mizu`).
 */
export const MIZU_DNS_DOMAIN = process.env.MIZU_DNS_DOMAIN ?? 'mizu'

/** Label keys stamped on every mizu-managed resource */
export const MIZU_LABELS = {
  managed: 'mizu.managed',
  project: 'mizu.project',
  entity: 'mizu.entity',
  entityType: 'mizu.entity.type',
} as const
