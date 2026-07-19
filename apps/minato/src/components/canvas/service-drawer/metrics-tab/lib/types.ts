import type { Service, ServiceMetricsSample } from '@mizu/nagare-domain'
import type { ChartConfig } from '@/components/ui/chart'
import type { Serialized } from '@/shared/api'

export interface MetricsTabProps {
  service: Serialized<Service>
}

export interface MetricChartCardProps {
  title: string
  /** Current (latest) reading, formatted. */
  currentLabel: string
  dataKey: 'cpuPercent' | 'memUsedMb'
  samples: ServiceMetricsSample[]
  config: ChartConfig
  /** Fixed y-domain max (e.g. memTotalMb); undefined = auto. */
  yMax?: number
  unit: string
}
