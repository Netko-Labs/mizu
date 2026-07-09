import type { Node } from '@xyflow/react'
import type { ReactNode } from 'react'

/** Params for creating a service via backend */
export interface AddServiceParams {
  name: string
  sourceType: 'image' | 'git' | 'template'
  sourceConfig: Record<string, unknown>
}

/** Params for creating a database via backend */
export interface AddDatabaseParams {
  name: string
  type: 'postgres' | 'mysql' | 'redis' | 'mongodb' | 'mariadb'
  version?: string
}

/** Params for persisting a new service dependency edge */
export interface CreateConnectionParams {
  fromServiceId: string
  toServiceId?: string
  toDatabaseId?: string
  connectionType: 'depends'
}

/** A connection normalized to the persisted dependency direction */
export interface PersistedConnection {
  edgeSource: string
  edgeTarget: string
  fromServiceId: string
  toServiceId?: string
  toDatabaseId?: string
}

export interface CanvasEditorProps {
  /** Callback when a node is selected */
  onNodeSelect?: (nodeId: string | null) => void
  /** Callback when an edge is selected */
  onEdgeSelect?: (edgeId: string | null) => void
  /** Callback to create a service via backend */
  onAddService?: (params: AddServiceParams) => void
  /** Callback to create a database via backend */
  onAddDatabase?: (params: AddDatabaseParams) => void
  /** Callback to persist a new service dependency edge */
  onCreateConnection?: (params: CreateConnectionParams) => void
  /** Callback to delete a persisted connection edge */
  onDeleteConnection?: (connectionId: string) => void
  /** Callback when node drag stops (for position persistence) */
  onNodeDragStop?: (node: Node) => void
  /** Additional class names for the container */
  className?: string
  /** Whether to show the controls */
  showControls?: boolean
  /** Whether to show the background grid */
  showBackground?: boolean
  /** Custom panel content (e.g., for toolbar) */
  panelContent?: ReactNode
}

/** Params for the drag-and-drop canvas hook */
export interface UseCanvasDndParams {
  onAddService?: (params: AddServiceParams) => void
  onAddDatabase?: (params: AddDatabaseParams) => void
}

/** Params for the connection canvas hook */
export interface UseCanvasConnectParams {
  onCreateConnection?: (params: CreateConnectionParams) => void
  onDeleteConnection?: (connectionId: string) => void
}

/** Params for the interactions canvas hook */
export interface UseCanvasInteractionsParams {
  onNodeSelect?: (nodeId: string | null) => void
  onEdgeSelect?: (edgeId: string | null) => void
}
