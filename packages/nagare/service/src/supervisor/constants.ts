/** How often the reconcile loop runs */
export const RECONCILE_INTERVAL_MS = 10_000

/** Give up restarting an entity after this many failed attempts */
export const MAX_RESTART_ATTEMPTS = 5

/** Exponential backoff base and cap between restart attempts */
export const BACKOFF_BASE_MS = 5_000
export const BACKOFF_CAP_MS = 300_000

/** Consecutive passes a container must be missing before re-deploying */
export const MISS_THRESHOLD = 2
