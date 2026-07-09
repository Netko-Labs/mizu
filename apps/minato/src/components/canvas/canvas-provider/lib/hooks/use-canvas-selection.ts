import { useCallback, useState } from 'react'
import type { CanvasSelectionHandlers } from '../types'

/**
 * Selection state for the canvas: the currently selected node/edge and
 * handlers to update or clear the selection.
 */
export function useCanvasSelection(): CanvasSelectionHandlers {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)

  const clearSelection = useCallback(() => {
    setSelectedNodeId(null)
    setSelectedEdgeId(null)
  }, [])

  return {
    selectedNodeId,
    selectedEdgeId,
    setSelectedNodeId,
    setSelectedEdgeId,
    clearSelection,
  }
}
