import type { ServiceMetricsSample } from '@mizu/nagare-domain'
import type { ProcSample } from '../runtime'

export interface MetricsEntry {
  samples: ServiceMetricsSample[]
  /** Previous raw /proc reading — CPU% is the jiffies delta between reads. */
  prev: ProcSample | null
  /** True once sampling failed for this container (e.g. distroless, no cat). */
  unsupported: boolean
}

export interface MetricsSamplerHandle {
  stop(): Promise<void>
}
