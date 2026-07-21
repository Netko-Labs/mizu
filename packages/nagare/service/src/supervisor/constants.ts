/** How often the reconcile loop runs */
export const RECONCILE_INTERVAL_MS = 10_000

/** Give up restarting an entity after this many failed attempts */
export const MAX_RESTART_ATTEMPTS = 5

/** Exponential backoff base and cap between restart attempts */
export const BACKOFF_BASE_MS = 5_000
export const BACKOFF_CAP_MS = 300_000

/** Consecutive passes a container must be missing before re-deploying */
export const MISS_THRESHOLD = 2

/** TCP liveness probe: per-connect timeout */
export const PROBE_TIMEOUT_MS = 2_000

/** Consecutive failed probes before a "running" container is recycled */
export const PROBE_FAILURE_THRESHOLD = 3

/** Skip probing containers younger than this — the app may still be booting */
export const PROBE_GRACE_MS = 60_000
