import type { Database, Service } from '@mizu/nagare-domain'
import type { PropertyAction } from '@/components/canvas/lib'
import type { Serialized } from '@/shared/api'
import type { DrawerTab } from '../../lib'
import type { SparklinePoint } from '../../shared'

export interface OverviewTabProps {
  service: Serialized<Service>
  projectSlug: string
  onAction?: (action: PropertyAction) => void
  /** Jump to another drawer tab (e.g. from a metric preview to Metrics). */
  onOpenTab?: (tab: DrawerTab) => void
}

export interface DatabaseOverviewProps {
  database: Serialized<Database>
  onAction?: (action: PropertyAction) => void
}

export interface OverviewStatRowProps {
  service: Serialized<Service>
  exposed: boolean
  hasIngress: boolean
}

export interface MetricsPreviewProps {
  service: Serialized<Service>
  onOpenTab?: (tab: DrawerTab) => void
}

export interface MetricPreviewCardProps {
  label: string
  value: string
  data: SparklinePoint[]
  color: string
  onClick?: () => void
}
