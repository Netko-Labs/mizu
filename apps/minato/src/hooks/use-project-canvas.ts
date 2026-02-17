import type { ConnectionType, Database, Service } from '@mizu/minato-domain'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import type { Edge, Node } from '@xyflow/react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { ConnectionEdgeData } from '@/components/canvas/edges/connection-edge'
import type { DatabaseNodeData } from '@/components/canvas/nodes/database-node'
import type { ServiceGroupNodeData } from '@/components/canvas/nodes/service-group-node'
import type { ServiceNodeData } from '@/components/canvas/nodes/service-node'
import { useTRPC } from '@/integrations/trpc'

/**
 * Debounce delay for position updates (ms).
 * Prevents excessive API calls during drag operations.
 */
const POSITION_UPDATE_DEBOUNCE = 300
const GROUP_RESIZE_UPDATE_DEBOUNCE = 250
const DEFAULT_GROUP_WIDTH = 560
const DEFAULT_GROUP_HEIGHT = 380
const GROUP_MIN_WIDTH = 420
const GROUP_MIN_HEIGHT = 260
const GROUP_NODE_PADDING = 16
const SERVICE_NODE_WIDTH = 240
const SERVICE_NODE_HEIGHT = 120
const DATABASE_NODE_WIDTH = 240
const DATABASE_NODE_HEIGHT = 160

export interface CanvasPosition {
  x: number
  y: number
}

export interface CanvasServiceGroup {
  id: string
  name: string
  canvasPosition: CanvasPosition
  size: {
    width: number
    height: number
  }
  memberNodeIds: string[]
  color?: string
}

interface ProjectSettingsShape {
  serviceGroups?: CanvasServiceGroup[]
  [key: string]: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseSettingsValue(value: unknown): Record<string, unknown> {
  if (isRecord(value)) {
    return value
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown
      if (isRecord(parsed)) {
        return parsed
      }
    } catch {
      return {}
    }
  }

  return {}
}

function parsePosition(
  value: unknown,
  fallback: CanvasPosition,
): {
  x: number
  y: number
} {
  if (isRecord(value) && typeof value.x === 'number' && typeof value.y === 'number') {
    return { x: value.x, y: value.y }
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown
      if (isRecord(parsed) && typeof parsed.x === 'number' && typeof parsed.y === 'number') {
        return { x: parsed.x, y: parsed.y }
      }
    } catch {
      return fallback
    }
  }

  return fallback
}

function parseEntityCanvasPosition(value: unknown, fallback: CanvasPosition): CanvasPosition {
  const parsed = parsePosition(value, fallback)
  // Historical rows can be persisted with the DB default origin.
  // Treat this as "unset" to avoid node overlap in the canvas.
  if (parsed.x === 0 && parsed.y === 0) {
    return fallback
  }
  return parsed
}

function parseGroupSize(
  value: unknown,
  fallback = { width: DEFAULT_GROUP_WIDTH, height: DEFAULT_GROUP_HEIGHT },
) {
  if (isRecord(value) && typeof value.width === 'number' && typeof value.height === 'number') {
    return { width: value.width, height: value.height }
  }
  return fallback
}

function clampNodeToGroupBounds(
  relativePosition: CanvasPosition,
  groupSize: { width: number; height: number },
  nodeSize: { width: number; height: number },
): CanvasPosition {
  const maxX = Math.max(GROUP_NODE_PADDING, groupSize.width - nodeSize.width - GROUP_NODE_PADDING)
  const maxY = Math.max(GROUP_NODE_PADDING, groupSize.height - nodeSize.height - GROUP_NODE_PADDING)

  return {
    x: Math.min(Math.max(relativePosition.x, GROUP_NODE_PADDING), maxX),
    y: Math.min(Math.max(relativePosition.y, GROUP_NODE_PADDING), maxY),
  }
}

function parseServiceGroups(settings: unknown): CanvasServiceGroup[] {
  const parsedSettings = parseSettingsValue(settings)
  if (!Array.isArray(parsedSettings.serviceGroups)) {
    return []
  }

  return parsedSettings.serviceGroups.flatMap((group, index) => {
    if (!isRecord(group) || typeof group.id !== 'string' || typeof group.name !== 'string') {
      return []
    }

    const memberNodeIds = Array.isArray(group.memberNodeIds)
      ? group.memberNodeIds.filter((member): member is string => typeof member === 'string')
      : []

    return [
      {
        id: group.id,
        name: group.name,
        canvasPosition: parsePosition(group.canvasPosition, {
          x: 80 + index * 40,
          y: 80 + index * 30,
        }),
        size: parseGroupSize(group.size),
        memberNodeIds: Array.from(new Set(memberNodeIds)),
        color: typeof group.color === 'string' ? group.color : undefined,
      },
    ]
  })
}

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
export function useProjectCanvas(projectId: string) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  // Debounce timers for position updates
  const positionTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const groupResizeTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    return () => {
      for (const timer of positionTimers.current.values()) {
        clearTimeout(timer)
      }
      for (const timer of groupResizeTimers.current.values()) {
        clearTimeout(timer)
      }
      positionTimers.current.clear()
      groupResizeTimers.current.clear()
    }
  }, [])

  // Fetch project with all services and databases (poll every 5s for status updates)
  const { data: project } = useSuspenseQuery({
    ...trpc.projects.getWithServices.queryOptions({ projectId }),
    refetchInterval: 5000,
  })

  // Fetch connections for the project
  const { data: connections } = useSuspenseQuery(
    trpc.connections.listForProject.queryOptions({ projectId }),
  )

  const serviceGroups = useMemo(() => parseServiceGroups(project?.settings), [project?.settings])

  // Service position update mutation
  const updateServicePositionMutation = useMutation(
    trpc.services.updatePosition.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getWithServices.queryKey({ projectId }),
        })
      },
    }),
  )

  // Database position update mutation
  const updateDatabasePositionMutation = useMutation(
    trpc.databases.updatePosition.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getWithServices.queryKey({ projectId }),
        })
      },
    }),
  )

  // Service create mutation
  const createServiceMutation = useMutation(
    trpc.services.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getWithServices.queryKey({ projectId }),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getGeneratedFiles.queryKey({ projectId }),
        })
      },
    }),
  )

  // Database create mutation
  const createDatabaseMutation = useMutation(
    trpc.databases.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getWithServices.queryKey({ projectId }),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getGeneratedFiles.queryKey({ projectId }),
        })
      },
    }),
  )

  // Connection mutations
  const createConnectionMutation = useMutation(
    trpc.connections.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.connections.listForProject.queryKey({ projectId }),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getGeneratedFiles.queryKey({ projectId }),
        })
      },
    }),
  )

  const deleteConnectionMutation = useMutation(
    trpc.connections.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.connections.listForProject.queryKey({ projectId }),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getGeneratedFiles.queryKey({ projectId }),
        })
      },
    }),
  )

  // Project settings update mutation (for service groups)
  const updateProjectMutation = useMutation(
    trpc.projects.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getWithServices.queryKey({ projectId }),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getGeneratedFiles.queryKey({ projectId }),
        })
      },
    }),
  )

  const updateServiceGroups = useCallback(
    (nextGroups: CanvasServiceGroup[]) => {
      const settings = parseSettingsValue(project?.settings)
      const nextSettings: ProjectSettingsShape = {
        ...settings,
        serviceGroups: nextGroups,
      }
      updateProjectMutation.mutate({
        projectId,
        settings: nextSettings,
      })
    },
    [project?.settings, projectId, updateProjectMutation],
  )

  // Convert services and databases to React Flow nodes
  const nodes = useMemo(() => {
    const groupByMemberId = new Map<string, CanvasServiceGroup>()
    for (const group of serviceGroups) {
      for (const memberId of group.memberNodeIds) {
        groupByMemberId.set(memberId, group)
      }
    }

    const serviceGroupNodes: Node<ServiceGroupNodeData>[] = serviceGroups.map((group) => ({
      id: group.id,
      type: 'service-group',
      position: group.canvasPosition,
      data: {
        group,
        memberCount: group.memberNodeIds.length,
      },
      style: {
        width: group.size.width,
        height: group.size.height,
      },
      width: group.size.width,
      height: group.size.height,
      zIndex: 0,
      selectable: true,
      draggable: true,
    }))

    const serviceNodes: Node<ServiceNodeData>[] =
      project?.services.map((service, i) => {
        const absolutePosition = parseEntityCanvasPosition(service.canvasPosition, {
          x: 100 + i * 280,
          y: 100,
        })
        const group = groupByMemberId.get(service.id)
        const position = group
          ? clampNodeToGroupBounds(
              {
                x: absolutePosition.x - group.canvasPosition.x,
                y: absolutePosition.y - group.canvasPosition.y,
              },
              group.size,
              { width: SERVICE_NODE_WIDTH, height: SERVICE_NODE_HEIGHT },
            )
          : absolutePosition

        return {
          id: service.id,
          type: 'service' as const,
          position,
          parentId: group?.id,
          extent: group ? 'parent' : undefined,
          data: { service },
          zIndex: group ? 10 : 1,
        }
      }) || []

    const databaseNodes: Node<DatabaseNodeData>[] =
      project?.databases.map((database, i) => {
        const absolutePosition = parseEntityCanvasPosition(database.canvasPosition, {
          x: 100 + i * 220,
          y: 300,
        })
        const group = groupByMemberId.get(database.id)
        const position = group
          ? clampNodeToGroupBounds(
              {
                x: absolutePosition.x - group.canvasPosition.x,
                y: absolutePosition.y - group.canvasPosition.y,
              },
              group.size,
              { width: DATABASE_NODE_WIDTH, height: DATABASE_NODE_HEIGHT },
            )
          : absolutePosition

        return {
          id: database.id,
          type: 'database' as const,
          position,
          parentId: group?.id,
          extent: group ? 'parent' : undefined,
          data: { database },
          zIndex: group ? 10 : 1,
        }
      }) || []

    return [...serviceGroupNodes, ...serviceNodes, ...databaseNodes]
  }, [project, serviceGroups])

  // Convert explicit DB connections to React Flow edges
  const edges = useMemo(() => {
    const validNodeIds = new Set([
      ...(project?.services.map((service) => service.id) ?? []),
      ...(project?.databases.map((database) => database.id) ?? []),
    ])

    const mappedEdges: Array<Edge<ConnectionEdgeData> | null> = (connections || []).map((conn) => {
      const target = conn.toServiceId || conn.toDatabaseId
      if (!target) return null
      if (!validNodeIds.has(conn.fromServiceId) || !validNodeIds.has(target)) {
        return null
      }

      return {
        id: conn.id,
        source: conn.fromServiceId,
        target,
        type: 'connection' as const,
        data: {
          connectionType: conn.connectionType,
          envVarName: conn.envVarName ?? undefined,
        } as ConnectionEdgeData,
      } as Edge<ConnectionEdgeData>
    })

    return mappedEdges.filter((edge): edge is Edge<ConnectionEdgeData> => edge !== null)
  }, [connections, project])

  /**
   * Handle position change for a node (service or database).
   * Debounced to prevent excessive API calls during drag operations.
   */
  const handlePositionChange = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
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

  /**
   * Create a connection between a service and another service or database.
   */
  const handleCreateConnection = useCallback(
    (params: {
      fromServiceId: string
      toServiceId?: string
      toDatabaseId?: string
      connectionType: ConnectionType
    }) => {
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
      deleteConnectionMutation.mutate({ connectionId })
    },
    [deleteConnectionMutation],
  )

  /**
   * Create a new service in the project.
   */
  const handleCreateService = useCallback(
    (params: {
      name: string
      sourceType: 'image' | 'git' | 'template'
      sourceConfig: Record<string, unknown>
    }) => {
      const sourceConfig = { ...params.sourceConfig }
      const createAsGroup = sourceConfig._createAsGroup === true
      delete sourceConfig._createAsGroup

      createServiceMutation.mutate(
        {
          projectId,
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
    [projectId, createServiceMutation, serviceGroups, updateServiceGroups],
  )

  /**
   * Create a new database in the project.
   */
  const handleCreateDatabase = useCallback(
    (params: {
      name: string
      type: 'postgres' | 'mysql' | 'redis' | 'mongodb' | 'mariadb'
      version?: string
    }) => {
      createDatabaseMutation.mutate({
        projectId,
        type: params.type,
        name: params.name,
        version: params.version,
      })
    },
    [projectId, createDatabaseMutation],
  )

  /**
   * Create a service group, optionally with member nodes.
   */
  const handleCreateServiceGroup = useCallback(
    (params?: { name?: string; canvasPosition?: CanvasPosition; memberNodeIds?: string[] }) => {
      const rawMembers = params?.memberNodeIds ?? []
      const memberNodeIds = Array.from(new Set(rawMembers))

      let canvasPosition = params?.canvasPosition
      if (!canvasPosition && memberNodeIds.length > 0) {
        const firstMemberId = memberNodeIds[0]
        const firstService = project?.services.find((service) => service.id === firstMemberId)
        const firstDatabase = project?.databases.find((database) => database.id === firstMemberId)
        const firstPosition = firstService
          ? parsePosition(firstService.canvasPosition, { x: 120, y: 120 })
          : firstDatabase
            ? parsePosition(firstDatabase.canvasPosition, { x: 120, y: 120 })
            : { x: 120, y: 120 }
        canvasPosition = {
          x: Math.max(20, firstPosition.x - 70),
          y: Math.max(20, firstPosition.y - 70),
        }
      }

      const nextGroup: CanvasServiceGroup = {
        id: `service-group-${crypto.randomUUID()}`,
        name: params?.name?.trim() || `Service Group ${serviceGroups.length + 1}`,
        canvasPosition: canvasPosition ?? {
          x: 80 + serviceGroups.length * 40,
          y: 80 + serviceGroups.length * 30,
        },
        size: {
          width: DEFAULT_GROUP_WIDTH,
          height: DEFAULT_GROUP_HEIGHT,
        },
        memberNodeIds,
      }

      // Remove members from other groups first, then add the new group
      const cleanedGroups = serviceGroups.map((group) => ({
        ...group,
        memberNodeIds: group.memberNodeIds.filter((id) => !memberNodeIds.includes(id)),
      }))

      updateServiceGroups([...cleanedGroups, nextGroup])
    },
    [project, serviceGroups, updateServiceGroups],
  )

  /**
   * Assign or remove a node from a service group.
   */
  const handleAssignNodeToServiceGroup = useCallback(
    (nodeId: string, groupId: string | null) => {
      const validNodeIds = new Set([
        ...(project?.services.map((service) => service.id) ?? []),
        ...(project?.databases.map((database) => database.id) ?? []),
      ])
      if (!validNodeIds.has(nodeId)) {
        return
      }

      const nextGroups = serviceGroups.map((group) => ({
        ...group,
        memberNodeIds: group.memberNodeIds.filter((id) => id !== nodeId),
      }))

      if (groupId) {
        const targetGroup = nextGroups.find((group) => group.id === groupId)
        if (targetGroup) {
          targetGroup.memberNodeIds = Array.from(new Set([...targetGroup.memberNodeIds, nodeId]))

          const service = project?.services.find((entry) => entry.id === nodeId)
          if (service) {
            const absolutePosition = parsePosition(service.canvasPosition, { x: 100, y: 100 })
            const nextRelative = clampNodeToGroupBounds(
              {
                x: absolutePosition.x - targetGroup.canvasPosition.x,
                y: absolutePosition.y - targetGroup.canvasPosition.y,
              },
              targetGroup.size,
              { width: SERVICE_NODE_WIDTH, height: SERVICE_NODE_HEIGHT },
            )
            updateServicePositionMutation.mutate({
              serviceId: nodeId,
              position: {
                x: targetGroup.canvasPosition.x + nextRelative.x,
                y: targetGroup.canvasPosition.y + nextRelative.y,
              },
            })
          }

          const database = project?.databases.find((entry) => entry.id === nodeId)
          if (database) {
            const absolutePosition = parsePosition(database.canvasPosition, { x: 100, y: 300 })
            const nextRelative = clampNodeToGroupBounds(
              {
                x: absolutePosition.x - targetGroup.canvasPosition.x,
                y: absolutePosition.y - targetGroup.canvasPosition.y,
              },
              targetGroup.size,
              { width: DATABASE_NODE_WIDTH, height: DATABASE_NODE_HEIGHT },
            )
            updateDatabasePositionMutation.mutate({
              databaseId: nodeId,
              position: {
                x: targetGroup.canvasPosition.x + nextRelative.x,
                y: targetGroup.canvasPosition.y + nextRelative.y,
              },
            })
          }
        }
      }

      updateServiceGroups(nextGroups)
    },
    [
      project,
      serviceGroups,
      updateServiceGroups,
      updateServicePositionMutation,
      updateDatabasePositionMutation,
    ],
  )

  /**
   * Delete a service group. Nodes remain in the project.
   */
  const handleDeleteServiceGroup = useCallback(
    (groupId: string) => {
      const nextGroups = serviceGroups.filter((group) => group.id !== groupId)
      updateServiceGroups(nextGroups)
    },
    [serviceGroups, updateServiceGroups],
  )

  /**
   * Move a service group and keep all child node positions synced (absolute coordinates).
   */
  const handleMoveServiceGroup = useCallback(
    (groupId: string, nextPosition: CanvasPosition) => {
      const group = serviceGroups.find((entry) => entry.id === groupId)
      if (!group) {
        return
      }

      const deltaX = nextPosition.x - group.canvasPosition.x
      const deltaY = nextPosition.y - group.canvasPosition.y
      if (deltaX === 0 && deltaY === 0) {
        return
      }

      for (const memberId of group.memberNodeIds) {
        const service = project?.services.find((item) => item.id === memberId)
        if (service) {
          const currentPosition = parsePosition(service.canvasPosition, { x: 0, y: 0 })
          updateServicePositionMutation.mutate({
            serviceId: service.id,
            position: {
              x: currentPosition.x + deltaX,
              y: currentPosition.y + deltaY,
            },
          })
          continue
        }

        const database = project?.databases.find((item) => item.id === memberId)
        if (database) {
          const currentPosition = parsePosition(database.canvasPosition, { x: 0, y: 0 })
          updateDatabasePositionMutation.mutate({
            databaseId: database.id,
            position: {
              x: currentPosition.x + deltaX,
              y: currentPosition.y + deltaY,
            },
          })
        }
      }

      const nextGroups = serviceGroups.map((entry) =>
        entry.id === groupId
          ? {
              ...entry,
              canvasPosition: nextPosition,
            }
          : entry,
      )
      updateServiceGroups(nextGroups)
    },
    [
      project,
      serviceGroups,
      updateServiceGroups,
      updateServicePositionMutation,
      updateDatabasePositionMutation,
    ],
  )

  /**
   * Resize a service group and persist in project settings.
   */
  const handleResizeServiceGroup = useCallback(
    (groupId: string, size: { width: number; height: number }) => {
      const existingGroup = serviceGroups.find((group) => group.id === groupId)
      if (!existingGroup) {
        return
      }

      const nextSize = {
        width: Math.max(GROUP_MIN_WIDTH, Math.round(size.width)),
        height: Math.max(GROUP_MIN_HEIGHT, Math.round(size.height)),
      }

      if (
        existingGroup.size.width === nextSize.width &&
        existingGroup.size.height === nextSize.height
      ) {
        return
      }

      const existingTimer = groupResizeTimers.current.get(groupId)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      const timer = setTimeout(() => {
        const nextGroups = serviceGroups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                size: nextSize,
              }
            : group,
        )
        updateServiceGroups(nextGroups)
        groupResizeTimers.current.delete(groupId)
      }, GROUP_RESIZE_UPDATE_DEBOUNCE)

      groupResizeTimers.current.set(groupId, timer)
    },
    [serviceGroups, updateServiceGroups],
  )

  /**
   * Find a service by ID from the project data.
   */
  const findService = useCallback(
    (serviceId: string): Service | undefined => {
      return project?.services.find((s) => s.id === serviceId)
    },
    [project],
  )

  /**
   * Find a database by ID from the project data.
   */
  const findDatabase = useCallback(
    (databaseId: string): Database | undefined => {
      return project?.databases.find((d) => d.id === databaseId)
    },
    [project],
  )

  /**
   * Determine if a node is a service or database.
   */
  const getNodeType = useCallback(
    (nodeId: string): 'service' | 'database' | 'service-group' | null => {
      if (project?.services.some((s) => s.id === nodeId)) {
        return 'service'
      }
      if (project?.databases.some((d) => d.id === nodeId)) {
        return 'database'
      }
      if (serviceGroups.some((group) => group.id === nodeId)) {
        return 'service-group'
      }
      return null
    },
    [project, serviceGroups],
  )

  /**
   * Find a service group by ID.
   */
  const findServiceGroup = useCallback(
    (groupId: string): CanvasServiceGroup | undefined => {
      return serviceGroups.find((group) => group.id === groupId)
    },
    [serviceGroups],
  )

  /**
   * Get the current service group ID for a node.
   */
  const getNodeServiceGroupId = useCallback(
    (nodeId: string): string | null => {
      const group = serviceGroups.find((entry) => entry.memberNodeIds.includes(nodeId))
      return group?.id ?? null
    },
    [serviceGroups],
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
