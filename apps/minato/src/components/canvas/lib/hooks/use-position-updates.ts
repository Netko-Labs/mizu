import { useCallback, useEffect, useRef } from 'react'
import { POSITION_UPDATE_DEBOUNCE } from '../constants'
import type { CanvasPosition, UsePositionUpdatesParams } from '../types'

/**
 * Debounced node position persistence for services and databases.
 */
export function usePositionUpdates({ project, mutations }: UsePositionUpdatesParams) {
  const { updateServicePositionMutation, updateDatabasePositionMutation } = mutations

  // Debounce timers for position updates
  const positionTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    return () => {
      for (const timer of positionTimers.current.values()) {
        clearTimeout(timer)
      }
      positionTimers.current.clear()
    }
  }, [])

  /**
   * Handle position change for a node (service or database).
   * Debounced to prevent excessive API calls during drag operations.
   */
  const handlePositionChange = useCallback(
    (nodeId: string, position: CanvasPosition) => {
      // Clear any existing timer for this node
      const existingTimer = positionTimers.current.get(nodeId)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      // Set a new debounced timer
      const timer = setTimeout(() => {
        // Determine if this is a service or database node
        const isService = project?.services.some((s) => s.id === nodeId)
        const isDatabase = project?.databases.some((d) => d.id === nodeId)

        if (isService) {
          updateServicePositionMutation.mutate({ serviceId: nodeId, position })
        } else if (isDatabase) {
          updateDatabasePositionMutation.mutate({ databaseId: nodeId, position })
        }

        positionTimers.current.delete(nodeId)
      }, POSITION_UPDATE_DEBOUNCE)

      positionTimers.current.set(nodeId, timer)
    },
    [project, updateServicePositionMutation, updateDatabasePositionMutation],
  )

  return { handlePositionChange }
}
