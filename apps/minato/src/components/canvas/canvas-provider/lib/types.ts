import type { Edge, Node, OnEdgesChange, OnNodesChange } from '@xyflow/react'
import type { ReactNode } from 'react'

export interface CanvasPosition {
  x: number
  y: number
}

export interface NodeSize {
  width?: number
  height?: number
}

export interface ContextMenuState {
  visible: boolean
  position: CanvasPosition
  nodeId: string | null
  nodeType: string | null
}

export interface CanvasSelectionHandlers {
  /** ID of the currently selected node */
  selectedNodeId: string | null
  /** ID of the currently selected edge */
  selectedEdgeId: string | null
  /** Set the selected node ID */
  setSelectedNodeId: (id: string | null) => void
  /** Set the selected edge ID */
  setSelectedEdgeId: (id: string | null) => void
  /** Clear selection */
  clearSelection: () => void
}

export interface GridToggleHandlers {
  /** Whether the background grid is visible */
  showGrid: boolean
  /** Toggle the background grid */
  toggleGrid: () => void
}

export interface ContextMenuHandlers {
  /** Context menu state */
  contextMenu: ContextMenuState | null
  /** Open context menu */
  openContextMenu: (
    position: CanvasPosition,
    nodeId?: string | null,
    nodeType?: string | null,
  ) => void
  /** Close context menu */
  closeContextMenu: () => void
}

export interface CanvasContextValue {
  /** Current nodes in the canvas */
  nodes: Node[]
  /** Current edges in the canvas */
  edges: Edge[]
  /** ID of the currently selected node */
  selectedNodeId: string | null
  /** ID of the currently selected edge */
  selectedEdgeId: string | null
  /** Set the selected node ID */
  setSelectedNodeId: (id: string | null) => void
  /** Set the selected edge ID */
  setSelectedEdgeId: (id: string | null) => void
  /** Add a new node to the canvas */
  addNode: (node: Node) => void
  /** Remove a node from the canvas */
  removeNode: (nodeId: string) => void
  /** Add a new edge to the canvas */
  addEdge: (edge: Edge) => void
  /** Remove an edge from the canvas */
  removeEdge: (edgeId: string) => void
  /** Update a node's position */
  updateNodePosition: (nodeId: string, position: CanvasPosition) => void
  /** Update a node's data */
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void
  /** Handler for React Flow node changes */
  onNodesChange: OnNodesChange
  /** Handler for React Flow edge changes */
  onEdgesChange: OnEdgesChange
  /** Clear selection */
  clearSelection: () => void
  /** Context menu state */
  contextMenu: ContextMenuState | null
  /** Open context menu */
  openContextMenu: (
    position: CanvasPosition,
    nodeId?: string | null,
    nodeType?: string | null,
  ) => void
  /** Close context menu */
  closeContextMenu: () => void
  /** Whether the background grid is visible */
  showGrid: boolean
  /** Toggle the background grid */
  toggleGrid: () => void
}

export interface CanvasProviderProps {
  children: ReactNode
  /** Initial nodes to populate the canvas */
  initialNodes?: Node[]
  /** Initial edges to populate the canvas */
  initialEdges?: Edge[]
  /** Callback when nodes change */
  onNodesUpdate?: (nodes: Node[]) => void
  /** Callback when edges change */
  onEdgesUpdate?: (edges: Edge[]) => void
}
