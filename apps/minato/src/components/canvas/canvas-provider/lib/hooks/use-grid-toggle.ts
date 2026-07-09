import { useCallback, useState } from 'react'
import type { GridToggleHandlers } from '../types'

/**
 * Background-grid visibility state for the canvas.
 */
export function useGridToggle(): GridToggleHandlers {
  const [showGrid, setShowGrid] = useState(true)

  const toggleGrid = useCallback(() => {
    setShowGrid((prev) => !prev)
  }, [])

  return { showGrid, toggleGrid }
}
