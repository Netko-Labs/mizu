import type { Database, Service } from '@mizu/nagare-domain'
import type { PropertyAction } from '@/components/canvas/lib'
import type { Serialized } from '@/shared/api'

export interface OverviewTabProps {
  service: Serialized<Service>
  projectSlug: string
  onAction?: (action: PropertyAction) => void
}

export interface DatabaseOverviewProps {
  database: Serialized<Database>
  onAction?: (action: PropertyAction) => void
}
