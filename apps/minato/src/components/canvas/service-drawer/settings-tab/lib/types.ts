import type { Database, Service } from '@mizu/nagare-domain'
import type { PropertyAction } from '@/components/canvas/lib'
import type { Serialized } from '@/shared/api'
import type { DrawerNodeType } from '../../lib'

export interface SettingsTabProps {
  nodeType: DrawerNodeType
  service: Serialized<Service> | null
  database: Serialized<Database> | null
  projectSlug: string
  onAction?: (action: PropertyAction) => void
  isActionPending?: boolean
}
