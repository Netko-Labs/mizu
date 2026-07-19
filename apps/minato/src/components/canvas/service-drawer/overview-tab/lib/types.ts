import type { Database, IngressRule, Service } from '@mizu/nagare-domain'
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
