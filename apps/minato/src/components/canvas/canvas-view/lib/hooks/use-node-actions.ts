import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import type { PropertyAction } from '@/components/canvas/lib'
import {
  deleteDatabase,
  deleteService,
  deployDatabase,
  deployService,
  projectKeys,
  restartService,
  startDatabase,
  startService,
  stopDatabase,
  stopService,
  updateDatabase,
  updateService,
} from '@/shared/api'

/**
 * The per-node action mutations (service + database lifecycle and edits).
 * `onNodeDeleted` lets the view clear its selection when a node goes away.
 */
export function useNodeActions(projectId: string, onNodeDeleted?: () => void) {
  const queryClient = useQueryClient()

  const invalidateProject = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: projectKeys.withServices(projectId) })
    queryClient.invalidateQueries({ queryKey: projectKeys.generatedFiles(projectId) })
  }, [queryClient, projectId])

  // Service mutations
  const updateServiceMutation = useMutation({
    mutationFn: updateService,
    onSuccess: invalidateProject,
  })
  const deleteServiceMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: invalidateProject,
  })
  const deployServiceMutation = useMutation({
    mutationFn: deployService,
    onSuccess: invalidateProject,
  })
  const startServiceMutation = useMutation({
    mutationFn: startService,
    onSuccess: invalidateProject,
  })
  const stopServiceMutation = useMutation({
    mutationFn: stopService,
    onSuccess: invalidateProject,
  })
  const restartServiceMutation = useMutation({
    mutationFn: restartService,
    onSuccess: invalidateProject,
  })

  // Database mutations
  const updateDatabaseMutation = useMutation({
    mutationFn: updateDatabase,
    onSuccess: invalidateProject,
  })
  const deleteDatabaseMutation = useMutation({
    mutationFn: deleteDatabase,
    onSuccess: invalidateProject,
  })
  const deployDatabaseMutation = useMutation({
    mutationFn: deployDatabase,
    onSuccess: invalidateProject,
  })
  const startDatabaseMutation = useMutation({
    mutationFn: startDatabase,
    onSuccess: invalidateProject,
  })
  const stopDatabaseMutation = useMutation({
    mutationFn: stopDatabase,
    onSuccess: invalidateProject,
  })

  const isActionPending =
    updateServiceMutation.isPending ||
    deleteServiceMutation.isPending ||
    deployServiceMutation.isPending ||
    startServiceMutation.isPending ||
    stopServiceMutation.isPending ||
    restartServiceMutation.isPending ||
    updateDatabaseMutation.isPending ||
    deleteDatabaseMutation.isPending ||
    deployDatabaseMutation.isPending ||
    startDatabaseMutation.isPending ||
    stopDatabaseMutation.isPending

  const handleNodeAction = useCallback(
    (nodeId: string, nodeType: 'service' | 'database' | null, action: PropertyAction) => {
      if (nodeType === 'service') {
        switch (action.type) {
          case 'updateName':
            updateServiceMutation.mutate({ serviceId: nodeId, name: action.name })
            break
          case 'updateSourceConfig':
            updateServiceMutation.mutate({ serviceId: nodeId, sourceConfig: action.sourceConfig })
            break
          case 'updateSettings':
            updateServiceMutation.mutate({ serviceId: nodeId, settings: action.settings })
            break
          case 'delete':
            deleteServiceMutation.mutate(nodeId)
            onNodeDeleted?.()
            break
          case 'deploy':
            deployServiceMutation.mutate(nodeId)
            break
          case 'start':
            startServiceMutation.mutate(nodeId)
            break
          case 'stop':
            stopServiceMutation.mutate(nodeId)
            break
          case 'restart':
            restartServiceMutation.mutate(nodeId)
            break
        }
      } else if (nodeType === 'database') {
        switch (action.type) {
          case 'updateName':
            updateDatabaseMutation.mutate({ databaseId: nodeId, name: action.name })
            break
          case 'updateCredentials':
            updateDatabaseMutation.mutate({
              databaseId: nodeId,
              credentials: JSON.stringify(action.credentials),
            })
            break
          case 'delete':
            deleteDatabaseMutation.mutate(nodeId)
            onNodeDeleted?.()
            break
          case 'deploy':
            deployDatabaseMutation.mutate(nodeId)
            break
          case 'start':
            startDatabaseMutation.mutate(nodeId)
            break
          case 'stop':
            stopDatabaseMutation.mutate(nodeId)
            break
        }
      }
    },
    [
      updateServiceMutation,
      deleteServiceMutation,
      deployServiceMutation,
      startServiceMutation,
      stopServiceMutation,
      restartServiceMutation,
      updateDatabaseMutation,
      deleteDatabaseMutation,
      deployDatabaseMutation,
      startDatabaseMutation,
      stopDatabaseMutation,
      onNodeDeleted,
    ],
  )

  return { handleNodeAction, isActionPending }
}
