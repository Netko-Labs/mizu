import { type RefObject, useEffect, useRef } from 'react'
import type { ContextMenuState } from '@/components/canvas/canvas-provider'

/**
 * Dismisses the context menu on outside click or Escape.
 * Returns the ref to attach to the menu container.
 */
export function useContextMenuDismiss(
  contextMenu: ContextMenuState | null,
  onDismiss: () => void,
): RefObject<HTMLDivElement | null> {
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!contextMenu) return

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as globalThis.Node)) {
        onDismiss()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [contextMenu, onDismiss])

  return menuRef
}
