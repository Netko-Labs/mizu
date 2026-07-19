import type { Database, Service } from '@mizu/nagare-domain'
import type { Icon } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import type { PropertyAction } from '@/components/canvas/lib'
import type { Serialized } from '@/shared/api'

export interface CanvasPosition {
  x: number
  y: number
}

export interface AddServiceParams {
  name: string
  sourceType: 'image' | 'git' | 'template'
  sourceConfig: Record<string, unknown>
}

export interface AddDatabaseParams {
  name: string
  type: 'postgres' | 'mysql' | 'redis' | 'mongodb' | 'mariadb'
  version?: string
}

export interface ServiceGroupSummary {
  id: string
  name: string
}

export interface CreateServiceGroupParams {
  name?: string
  canvasPosition?: CanvasPosition
  memberNodeIds?: string[]
}

export type NodeLifecycleActionType = 'deploy' | 'start' | 'stop' | 'restart'

export interface NodeLifecycleAction {
  label: string
  icon: Icon
  actionType: NodeLifecycleActionType
}

export interface CanvasContextMenuProps {
  findService: (id: string) => Serialized<Service> | undefined
  findDatabase: (id: string) => Serialized<Database> | undefined
  onEditProperties: (nodeId: string) => void
  onNodeAction?: (
    nodeId: string,
    nodeType: 'service' | 'database' | null,
    action: PropertyAction,
  ) => void
  serviceGroups?: ServiceGroupSummary[]
  getNodeServiceGroupId?: (id: string) => string | null
  onCreateServiceGroup?: (params?: CreateServiceGroupParams) => void
  onAssignNodeToServiceGroup?: (nodeId: string, groupId: string | null) => void
  onDeleteServiceGroup?: (groupId: string) => void
  onViewLogs?: (nodeId: string, nodeType: 'service' | 'database') => void
  onAddService: (params: AddServiceParams) => void
  onAddDatabase: (params: AddDatabaseParams) => void
}

export interface MenuItemProps {
  label: string
  icon?: ReactNode
  onClick: () => void
  destructive?: boolean
  disabled?: boolean
}

export interface CanvasContextMenuNodeSectionProps {
  nodeId: string
  nodeType: string | null
  findService: (id: string) => Serialized<Service> | undefined
  findDatabase: (id: string) => Serialized<Database> | undefined
  onEditProperties: (nodeId: string) => void
  onNodeAction?: (
    nodeId: string,
    nodeType: 'service' | 'database' | null,
    action: PropertyAction,
  ) => void
  serviceGroups: ServiceGroupSummary[]
  getNodeServiceGroupId?: (id: string) => string | null
  onCreateServiceGroup?: (params?: CreateServiceGroupParams) => void
  onAssignNodeToServiceGroup?: (nodeId: string, groupId: string | null) => void
  onDeleteServiceGroup?: (groupId: string) => void
  onViewLogs?: (nodeId: string, nodeType: 'service' | 'database') => void
}

export interface CanvasContextMenuPaneSectionProps {
  position: CanvasPosition
  onAddService: (params: AddServiceParams) => void
  onAddDatabase: (params: AddDatabaseParams) => void
  onCreateServiceGroup?: (params?: CreateServiceGroupParams) => void
}
