import { useCallback, useState } from 'react'
import type { CanvasPosition, ContextMenuHandlers, ContextMenuState } from '../types'

/**
 * Context-menu state for the canvas: current menu state plus open/close handlers.
 */
export function useContextMenu(): ContextMenuHandlers {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)

  const openContextMenu = useCallback(
    (position: CanvasPosition, nodeId?: string | null, nodeType?: string | null) => {
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

  return { contextMenu, openContextMenu, closeContextMenu }
}
