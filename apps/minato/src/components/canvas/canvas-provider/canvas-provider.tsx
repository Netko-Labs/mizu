import {
  applyEdgeChanges,
  applyNodeChanges,
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import {
  createContext,
  type CSSProperties,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

function getNodeSize(node: Node): { width?: number; height?: number } {
  const style = node.style as Record<string, unknown> | undefined
  const styleWidth = style?.width
  const styleHeight = style?.height

  const width =
    typeof node.width === 'number'
      ? node.width
      : typeof styleWidth === 'number'
        ? styleWidth
        : undefined
  const height =
    typeof node.height === 'number'
      ? node.height
      : typeof styleHeight === 'number'
        ? styleHeight
        : undefined

  return { width, height }
}

export interface ContextMenuState {
  visible: boolean
  position: { x: number; y: number }
  nodeId: string | null
  nodeType: string | null
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
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void
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
    position: { x: number; y: number },
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

const CanvasContext = createContext<CanvasContextValue | null>(null)

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

export function CanvasProvider(props: CanvasProviderProps) {
  return (
    <ReactFlowProvider>
      <CanvasProviderInner {...props} />
    </ReactFlowProvider>
  )
}

function CanvasProviderInner({
  children,
  initialNodes = [],
  initialEdges = [],
  onNodesUpdate,
  onEdgesUpdate,
}: CanvasProviderProps) {
  const [nodes, setNodes] = useNodesState(initialNodes)
  const [edges, setEdges] = useEdgesState(initialEdges)

  // Sync external node/edge changes (e.g., from server refetch) into React Flow state
  useEffect(() => {
    setNodes((current) => {
      const currentMap = new Map(current.map((n) => [n.id, n]))

      // Merge local runtime state with server state.
      // Keep local positions/sizes during interaction, but adopt incoming positions
      // when node structure changed (e.g. moved into/out of a service group).
      const merged = initialNodes.map((incoming) => {
        const n = currentMap.get(incoming.id)
        if (!n) {
          return incoming
        }
        const structureChanged =
          incoming.parentId !== n.parentId ||
          incoming.type !== n.type ||
          incoming.extent !== n.extent

        const nextNode: Node = {
          ...incoming,
          position: structureChanged ? incoming.position : n.position,
        }

        if (incoming.type === 'service-group') {
          const currentSize = getNodeSize(n)
          if (currentSize.width || currentSize.height) {
            const incomingStyle = (incoming.style as Record<string, unknown> | undefined) ?? {}
            nextNode.style = {
              ...incomingStyle,
              ...(currentSize.width != null && { width: currentSize.width }),
              ...(currentSize.height != null && { height: currentSize.height }),
            } as CSSProperties
          }
        }

        return nextNode
      })

      return merged
    })
  }, [initialNodes, setNodes])

  useEffect(() => {
    setEdges((current) => {
      const currentIds = new Set(current.map((e) => e.id))
      const incomingIds = new Set(initialEdges.map((e) => e.id))

      const kept = current.filter((e) => incomingIds.has(e.id))
      const added = initialEdges.filter((e) => !currentIds.has(e.id))

      if (added.length === 0 && kept.length === current.length) {
        return current
      }
      return [...kept, ...added]
    })
  }, [initialEdges, setEdges])

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [showGrid, setShowGrid] = useState(true)

  const toggleGrid = useCallback(() => {
    setShowGrid((prev) => !prev)
  }, [])

  const openContextMenu = useCallback(
    (position: { x: number; y: number }, nodeId?: string | null, nodeType?: string | null) => {
      setContextMenu({
        visible: true,
        position,
        nodeId: nodeId ?? null,
        nodeType: nodeType ?? null,
      })
    },
    [],
  )

  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => {
        const updated = applyNodeChanges(changes, nds)
        onNodesUpdate?.(updated)
        return updated
      })
    },
    [setNodes, onNodesUpdate],
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => {
        const updated = applyEdgeChanges(changes, eds)
        onEdgesUpdate?.(updated)
        return updated
      })
    },
    [setEdges, onEdgesUpdate],
  )

  const addNode = useCallback(
    (node: Node) => {
      setNodes((nds) => {
        const updated = [...nds, node]
        onNodesUpdate?.(updated)
        return updated
      })
    },
    [setNodes, onNodesUpdate],
  )

  const removeNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const updated = nds.filter((node) => node.id !== nodeId)
        onNodesUpdate?.(updated)
        return updated
      })
      // Also remove connected edges
      setEdges((eds) => {
        const updated = eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
        onEdgesUpdate?.(updated)
        return updated
      })
      // Clear selection if the removed node was selected
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null)
      }
    },
    [setNodes, setEdges, selectedNodeId, onNodesUpdate, onEdgesUpdate],
  )

  const addEdge = useCallback(
    (edge: Edge) => {
      setEdges((eds) => {
        const updated = [...eds, edge]
        onEdgesUpdate?.(updated)
        return updated
      })
    },
    [setEdges, onEdgesUpdate],
  )

  const removeEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => {
        const updated = eds.filter((edge) => edge.id !== edgeId)
        onEdgesUpdate?.(updated)
        return updated
      })
      // Clear selection if the removed edge was selected
      if (selectedEdgeId === edgeId) {
        setSelectedEdgeId(null)
      }
    },
    [setEdges, selectedEdgeId, onEdgesUpdate],
  )

  const updateNodePosition = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      setNodes((nds) => {
        const updated = nds.map((node) => (node.id === nodeId ? { ...node, position } : node))
        onNodesUpdate?.(updated)
        return updated
      })
    },
    [setNodes, onNodesUpdate],
  )

  const updateNodeData = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      setNodes((nds) => {
        const updated = nds.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node,
        )
        onNodesUpdate?.(updated)
        return updated
      })
    },
    [setNodes, onNodesUpdate],
  )

  const clearSelection = useCallback(() => {
    setSelectedNodeId(null)
    setSelectedEdgeId(null)
  }, [])

  const value = useMemo<CanvasContextValue>(
    () => ({
      nodes,
      edges,
      selectedNodeId,
      selectedEdgeId,
      setSelectedNodeId,
      setSelectedEdgeId,
      addNode,
      removeNode,
      addEdge,
      removeEdge,
      updateNodePosition,
      updateNodeData,
      onNodesChange,
      onEdgesChange,
      clearSelection,
      contextMenu,
      openContextMenu,
      closeContextMenu,
      showGrid,
      toggleGrid,
    }),
    [
      nodes,
      edges,
      selectedNodeId,
      selectedEdgeId,
      addNode,
      removeNode,
      addEdge,
      removeEdge,
      updateNodePosition,
      updateNodeData,
      onNodesChange,
      onEdgesChange,
      clearSelection,
      contextMenu,
      openContextMenu,
      closeContextMenu,
      showGrid,
      toggleGrid,
    ],
  )

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
}

/**
 * Hook to access the canvas context.
 * Must be used within a CanvasProvider.
 */
export function useCanvas(): CanvasContextValue {
  const ctx = useContext(CanvasContext)
  if (!ctx) {
    throw new Error('useCanvas must be used within a CanvasProvider')
  }
  return ctx
}
