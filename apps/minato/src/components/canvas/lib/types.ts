import type { ConnectionType, ServiceConnection } from '@mizu/nagare-domain'
import type { ProjectWithServices, Serialized } from '@/shared/api'
import type { useCanvasMutations } from './hooks/use-canvas-mutations'

export interface CanvasPosition {
  x: number
  y: number
}

export interface CanvasSize {
  width: number
  height: number
}

export interface CanvasServiceGroup {
  id: string
  name: string
  canvasPosition: CanvasPosition
  size: CanvasSize
  memberNodeIds: string[]
  color?: string
}

export interface ProjectSettingsShape {
  serviceGroups?: CanvasServiceGroup[]
  [key: string]: unknown
}

/** Project payload shared across the canvas hooks (suspense query data). */
export type CanvasProject = Serialized<ProjectWithServices> | undefined

/** A single project connection as delivered over the wire. */
export type CanvasConnection = Serialized<ServiceConnection>

/** All mutation objects produced by useCanvasMutations. */
export type CanvasMutations = ReturnType<typeof useCanvasMutations>

export interface CreateConnectionParams {
  fromServiceId: string
  toServiceId?: string
  toDatabaseId?: string
  connectionType: ConnectionType
}

export interface CreateServiceParams {
  name: string
  sourceType: 'image' | 'git' | 'template'
  sourceConfig: Record<string, unknown>
}

export interface CreateDatabaseParams {
  name: string
  type: 'postgres' | 'mysql' | 'redis' | 'mongodb' | 'mariadb'
  version?: string
}

export interface CreateServiceGroupParams {
  name?: string
  canvasPosition?: CanvasPosition
  memberNodeIds?: string[]
}

export interface UseCanvasGraphParams {
  project: CanvasProject
  connections: CanvasConnection[]
  serviceGroups: CanvasServiceGroup[]
}

export interface UseServiceGroupsParams {
  projectId: string
  project: CanvasProject
  mutations: CanvasMutations
}

export interface UsePositionUpdatesParams {
  project: CanvasProject
  mutations: CanvasMutations
}
