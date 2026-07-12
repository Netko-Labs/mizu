import { useCallback } from 'react'
import { DEFAULT_GROUP_HEIGHT, DEFAULT_GROUP_WIDTH } from '../constants'
import type {
  CanvasServiceGroup,
  CreateConnectionParams,
  CreateDatabaseParams,
  CreateServiceParams,
} from '../types'
import { parsePosition } from '../utils'
import { useCanvasEntities, useCanvasGraph } from './use-canvas-entities'
import { useCanvasMutations } from './use-canvas-mutations'
import { usePositionUpdates } from './use-position-updates'
import { useServiceGroups } from './use-service-groups'

/**
 * Hook to manage project canvas state with tRPC integration.
 *
 * Provides:
 * - Fetching project with services and databases
 * - Converting entities to React Flow nodes/edges
 * - Mutation functions for CRUD operations
 * - Debounced position updates
 * - Connection creation/deletion
 */
export function useProjectCanvas(projectId: string, environmentId?: string) {
  const mutations = useCanvasMutations(projectId)
  const {
    createServiceMutation,
    createDatabaseMutation,
    createConnectionMutation,
    deleteConnectionMutation,
    updateServicePositionMutation,
    updateDatabasePositionMutation,
    updateProjectMutation,
  } = mutations

  const { project, connections, findService, findDatabase } = useCanvasEntities(
    projectId,
    environmentId,
  )

  const {
    serviceGroups,
    updateServiceGroups,
    handleCreateServiceGroup,
    handleAssignNodeToServiceGroup,
    handleDeleteServiceGroup,
    handleMoveServiceGroup,
    handleResizeServiceGroup,
  } = useServiceGroups({ projectId, project, mutations })

  const { nodes, edges, getNodeType, findServiceGroup, getNodeServiceGroupId } = useCanvasGraph({
    project,
    connections,
    serviceGroups,
  })

  const { handlePositionChange } = usePositionUpdates({ project, mutations })

  /**
   * Create a connection between a service and another service or database.
   */
  const handleCreateConnection = useCallback(
    (params: CreateConnectionParams) => {
      const targetId = params.toServiceId ?? params.toDatabaseId
      if (!targetId) {
        return
      }

      const alreadyExists = (connections || []).some((connection) => {
        const existingTarget = connection.toServiceId ?? connection.toDatabaseId
        return (
          connection.fromServiceId === params.fromServiceId &&
          existingTarget === targetId &&
          connection.connectionType === params.connectionType
        )
      })

      if (alreadyExists) {
        return
      }

      const targetType = params.toDatabaseId ? 'database' : 'service'
      createConnectionMutation.mutate({
        fromServiceId: params.fromServiceId,
        toServiceId: params.toServiceId,
        toDatabaseId: params.toDatabaseId,
        targetType,
        connectionType: params.connectionType,
      })
    },
    [createConnectionMutation, connections],
  )

  /**
   * Delete a connection by ID.
   */
  const handleDeleteConnection = useCallback(
    (connectionId: string) => {
      deleteConnectionMutation.mutate(connectionId)
    },
    [deleteConnectionMutation],
  )

  /**
   * Create a new service in the project.
   */
  const handleCreateService = useCallback(
    (params: CreateServiceParams) => {
      const sourceConfig = { ...params.sourceConfig }
      const createAsGroup = sourceConfig._createAsGroup === true
      delete sourceConfig._createAsGroup

      createServiceMutation.mutate(
        {
          projectId,
          environmentId,
          name: params.name,
          sourceType: params.sourceType,
          sourceConfig: sourceConfig as Parameters<
            typeof createServiceMutation.mutate
          >[0]['sourceConfig'],
        },
        {
          onSuccess: (createdService) => {
            if (createAsGroup && createdService?.id) {
              const memberNodeIds = [createdService.id]
              const nextGroup: CanvasServiceGroup = {
                id: `service-group-${crypto.randomUUID()}`,
                name: params.name || `Service Group ${serviceGroups.length + 1}`,
                canvasPosition: parsePosition(createdService.canvasPosition, {
                  x: 80 + serviceGroups.length * 40,
                  y: 80 + serviceGroups.length * 30,
                }),
                size: {
                  width: DEFAULT_GROUP_WIDTH,
                  height: DEFAULT_GROUP_HEIGHT,
                },
                memberNodeIds,
              }

              const cleanedGroups = serviceGroups.map((group) => ({
                ...group,
                memberNodeIds: group.memberNodeIds.filter((id) => !memberNodeIds.includes(id)),
              }))

              updateServiceGroups([...cleanedGroups, nextGroup])
            }
          },
        },
      )
    },
    [projectId, environmentId, createServiceMutation, serviceGroups, updateServiceGroups],
  )

  /**
   * Create a new database in the project.
   */
  const handleCreateDatabase = useCallback(
    (params: CreateDatabaseParams) => {
      createDatabaseMutation.mutate({
        projectId,
        environmentId,
        type: params.type,
        name: params.name,
        version: params.version,
      })
    },
    [projectId, environmentId, createDatabaseMutation],
  )

  return {
    project,
    nodes,
    edges,
    connections,
    serviceGroups,
    handlePositionChange,
    handleCreateService,
    handleCreateDatabase,
    handleCreateConnection,
    handleDeleteConnection,
    handleCreateServiceGroup,
    handleAssignNodeToServiceGroup,
    handleDeleteServiceGroup,
    handleMoveServiceGroup,
    handleResizeServiceGroup,
    findService,
    findDatabase,
    findServiceGroup,
    getNodeType,
    getNodeServiceGroupId,
    isUpdatingPosition:
      updateServicePositionMutation.isPending || updateDatabasePositionMutation.isPending,
    isCreatingService: createServiceMutation.isPending,
    isCreatingDatabase: createDatabaseMutation.isPending,
    isCreatingConnection: createConnectionMutation.isPending,
    isDeletingConnection: deleteConnectionMutation.isPending,
    isUpdatingServiceGroups: updateProjectMutation.isPending,
  }
}
