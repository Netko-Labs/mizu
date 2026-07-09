import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  connectionKeys,
  createConnection,
  createDatabase,
  createService,
  deleteConnection,
  projectKeys,
  updateDatabasePosition,
  updateProject,
  updateServicePosition,
} from '@/shared/api'

/**
 * Mutations for the project canvas, with query invalidation wired in.
 */
export function useCanvasMutations(projectId: string) {
  const queryClient = useQueryClient()

  const invalidateProject = () => {
    queryClient.invalidateQueries({ queryKey: projectKeys.withServices(projectId) })
  }
  const invalidateGeneratedFiles = () => {
    queryClient.invalidateQueries({ queryKey: projectKeys.generatedFiles(projectId) })
  }
  const invalidateConnections = () => {
    queryClient.invalidateQueries({ queryKey: connectionKeys.forProject(projectId) })
  }

  // Service position update mutation
  const updateServicePositionMutation = useMutation({
    mutationFn: updateServicePosition,
    onSuccess: invalidateProject,
  })

  // Database position update mutation
  const updateDatabasePositionMutation = useMutation({
    mutationFn: updateDatabasePosition,
    onSuccess: invalidateProject,
  })

  // Service create mutation
  const createServiceMutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      invalidateProject()
      invalidateGeneratedFiles()
    },
  })

  // Database create mutation
  const createDatabaseMutation = useMutation({
    mutationFn: createDatabase,
    onSuccess: () => {
      invalidateProject()
      invalidateGeneratedFiles()
    },
  })

  // Connection mutations
  const createConnectionMutation = useMutation({
    mutationFn: createConnection,
    onSuccess: () => {
      invalidateConnections()
      invalidateGeneratedFiles()
    },
  })

  const deleteConnectionMutation = useMutation({
    mutationFn: deleteConnection,
    onSuccess: () => {
      invalidateConnections()
      invalidateGeneratedFiles()
    },
  })

  // Project settings update mutation (for service groups)
  const updateProjectMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      invalidateProject()
      invalidateGeneratedFiles()
    },
  })

  return {
    updateServicePositionMutation,
    updateDatabasePositionMutation,
    createServiceMutation,
    createDatabaseMutation,
    createConnectionMutation,
    deleteConnectionMutation,
    updateProjectMutation,
  }
}
