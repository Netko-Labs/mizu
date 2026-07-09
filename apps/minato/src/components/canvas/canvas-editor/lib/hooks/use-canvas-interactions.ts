import type { Edge, Node } from '@xyflow/react'
import { type MouseEvent as ReactMouseEvent, useCallback } from 'react'
import { useCanvas } from '@/components/canvas/canvas-provider'
import type { UseCanvasInteractionsParams } from '../types'

export function useCanvasInteractions({ onNodeSelect, onEdgeSelect }: UseCanvasInteractionsParams) {
  const {
    setSelectedNodeId,
    setSelectedEdgeId,
    clearSelection,
    openContextMenu,
    closeContextMenu,
  } = useCanvas()

  // Handle node click
  const handleNodeClick = useCallback(
    (_event: ReactMouseEvent, node: Node) => {
      setSelectedNodeId(node.id)
      setSelectedEdgeId(null)
      onNodeSelect?.(node.id)
    },
    [setSelectedNodeId, setSelectedEdgeId, onNodeSelect],
  )

  // Handle edge click
  const handleEdgeClick = useCallback(
    (_event: ReactMouseEvent, edge: Edge) => {
      setSelectedEdgeId(edge.id)
      setSelectedNodeId(null)
      onEdgeSelect?.(edge.id)
    },
    [setSelectedEdgeId, setSelectedNodeId, onEdgeSelect],
  )

  // Handle pane click (deselect)
  const handlePaneClick = useCallback(() => {
    clearSelection()
    closeContextMenu()
    onNodeSelect?.(null)
    onEdgeSelect?.(null)
  }, [clearSelection, closeContextMenu, onNodeSelect, onEdgeSelect])

  // Handle node context menu (right-click)
  const handleNodeContextMenu = useCallback(
    (event: ReactMouseEvent, node: Node) => {
      event.preventDefault()
      openContextMenu({ x: event.clientX, y: event.clientY }, node.id, node.type)
    },
    [openContextMenu],
  )

  // Handle pane context menu (right-click on background)
  const handlePaneContextMenu = useCallback(
    (event: MouseEvent | ReactMouseEvent) => {
      event.preventDefault()
      openContextMenu({ x: event.clientX, y: event.clientY })
    },
    [openContextMenu],
  )

  return {
    handleNodeClick,
    handleEdgeClick,
    handlePaneClick,
    handleNodeContextMenu,
    handlePaneContextMenu,
  }
}
