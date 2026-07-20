import type { Database, IngressRule, Service } from '@mizu/nagare-domain'
import type { Icon } from '@tabler/icons-react'
import type { PropertyAction } from '@/components/canvas/lib'
import type { Serialized } from '@/shared/api'

export type DrawerTab =
  | 'overview'
  | 'deployments'
  | 'variables'
  | 'metrics'
  | 'logs'
  | 'console'
  | 'files'
  | 'settings'

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

export interface ServiceIngressEditorProps {
  rules: IngressRule[]
  ports: number[]
  running: boolean
  autoUrl: string | null
  onChange: (rules: IngressRule[]) => void
}

export interface UseIngressRulesOptions {
  ports: number[]
  rules: IngressRule[]
  onChange: (rules: IngressRule[]) => void
}

export interface UseIngressRulesResult {
  port: number
  setPort: (port: number) => void
  hostType: IngressRule['hostType']
  setHostType: (hostType: IngressRule['hostType']) => void
  host: string
  setHost: (host: string) => void
  canAdd: boolean
  addRule: () => void
  removeRule: (id: string) => void
}
