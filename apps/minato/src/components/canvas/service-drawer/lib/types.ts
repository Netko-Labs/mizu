import type { Database, Service } from '@mizu/nagare-domain'
import type { Icon } from '@tabler/icons-react'
import type { PropertyAction } from '@/components/canvas/lib'
import type { Serialized } from '@/shared/api'

export type DrawerTab = 'overview' | 'deployments' | 'variables' | 'metrics' | 'logs' | 'settings'

export type DrawerNodeType = 'service' | 'database'

export interface TabDefinition {
  id: DrawerTab
  label: string
  icon: Icon
  appliesTo: DrawerNodeType[]
  implemented: boolean
}

export interface StatusMeta {
  label: string
  color: string
  dot: string
}

export interface ServiceDrawerProps {
  nodeId: string
  nodeType: DrawerNodeType | null
  service: Serialized<Service> | null
  database: Serialized<Database> | null
  projectSlug: string
  initialTab?: DrawerTab | null
  onClose: () => void
  onAction?: (action: PropertyAction) => void
  isActionPending?: boolean
}

export interface ServiceDrawerHeaderProps {
  nodeType: DrawerNodeType
  service: Serialized<Service> | null
  database: Serialized<Database> | null
  onClose: () => void
  onAction?: (action: PropertyAction) => void
  isActionPending?: boolean
}

export interface UseServiceDrawerOptions {
  nodeId: string
  initialTab?: DrawerTab | null
}

export interface UseServiceDrawerResult {
  tab: DrawerTab
  setTab: (tab: DrawerTab) => void
}
