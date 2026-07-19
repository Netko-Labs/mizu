/** Sampling cadence. */
export const METRICS_INTERVAL_MS = 15_000
/** Ring size per service — 240 × 15s ≈ 1h of history. */
export const METRICS_RETENTION_SAMPLES = 240
/** Concurrent exec probes per pass. */
export const METRICS_SAMPLE_CONCURRENCY = 4
