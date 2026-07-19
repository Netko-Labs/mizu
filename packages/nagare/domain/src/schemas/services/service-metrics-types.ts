/**
 * Response shapes for GET /services/:id/metrics. Owned by domain so the
 * frontend can type responses without importing server code (eden@1.4 infers
 * complex objects as `{}` under Elysia 2, so the api layer casts against
 * these).
 */

export interface ServiceMetricsSample {
  /** Sample time, epoch ms. */
  t: number
  /** Aggregate CPU utilisation percent (0–100 × cores). */
  cpuPercent: number
  memUsedMb: number
  memTotalMb: number
}

export interface ServiceMetrics {
  /** False when the service isn't running or its image can't be sampled. */
  available: boolean
  intervalMs: number
  samples: ServiceMetricsSample[]
}
