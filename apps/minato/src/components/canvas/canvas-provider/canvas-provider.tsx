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
  type CSSProperties,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import {
  type CanvasContextValue,
  type CanvasPosition,
  type CanvasProviderProps,
  getNodeSize,
  useCanvasSelection,
  useContextMenu,
  useGridToggle,
} from './lib'

const CanvasContext = createContext<CanvasContextValue | null>(null)

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

  const { selectedNodeId, selectedEdgeId, setSelectedNodeId, setSelectedEdgeId, clearSelection } =
    useCanvasSelection()
  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu()
  const { showGrid, toggleGrid } = useGridToggle()

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
    [setNodes, setEdges, selectedNodeId, setSelectedNodeId, onNodesUpdate, onEdgesUpdate],
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
    [setEdges, selectedEdgeId, setSelectedEdgeId, onEdgesUpdate],
  )

  const updateNodePosition = useCallback(
    (nodeId: string, position: CanvasPosition) => {
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
