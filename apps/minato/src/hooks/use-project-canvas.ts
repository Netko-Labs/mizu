import type { ConnectionType, Database, Service } from '@mizu/minato-domain'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import type { Edge, Node } from '@xyflow/react'
import { useCallback, useMemo, useRef } from 'react'
import type { ConnectionEdgeData } from '@/components/canvas/edges/connection-edge'
import type { DatabaseNodeData } from '@/components/canvas/nodes/database-node'
import type { ServiceNodeData } from '@/components/canvas/nodes/service-node'
import { useTRPC } from '@/integrations/trpc'

/**
 * Debounce delay for position updates (ms).
 * Prevents excessive API calls during drag operations.
 */
const POSITION_UPDATE_DEBOUNCE = 300

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

  // Fetch project with all services and databases (poll every 5s for status updates)
  const { data: project } = useSuspenseQuery({
    ...trpc.projects.getWithServices.queryOptions({ projectId }),
    refetchInterval: 5000,
  })

  // Fetch connections for the project
  const { data: connections } = useSuspenseQuery(
    trpc.connections.listForProject.queryOptions({ projectId }),
  )

  // Convert services and databases to React Flow nodes
  const nodes = useMemo(() => {
    const serviceNodes: Node<ServiceNodeData>[] =
      project?.services.map((service, i) => ({
        id: service.id,
        type: 'service' as const,
        position: (service.canvasPosition as { x: number; y: number }) || {
          x: 100 + i * 280,
          y: 100,
        },
        data: { service },
      })) || []

    const databaseNodes: Node<DatabaseNodeData>[] =
      project?.databases.map((database, i) => ({
        id: database.id,
        type: 'database' as const,
        position: (database.canvasPosition as { x: number; y: number }) || {
          x: 100 + i * 220,
          y: 300,
        },
        data: { database },
      })) || []

    return [...serviceNodes, ...databaseNodes]
  }, [project])

  // Convert connections to React Flow edges, plus auto-generate network edges
  const edges = useMemo(() => {
    // Explicit connection edges from the database
    const connectionEdges = (connections || []).map((conn) => ({
      id: conn.id,
      source: conn.fromServiceId,
      target: conn.toServiceId || conn.toDatabaseId || '',
      type: 'connection' as const,
      data: {
        connectionType: conn.connectionType,
        envVarName: conn.envVarName ?? undefined,
      } as ConnectionEdgeData,
    })) as Edge<ConnectionEdgeData>[]

    // Build a set of already-connected pairs to avoid duplicates
    const connectedPairs = new Set(
      connectionEdges.map((e) => [e.source, e.target].sort().join('|')),
    )

    // Auto-generate network edges between all services and databases in the project
    // All nodes share the same project Docker network by default
    const allServices = project?.services || []
    const allDatabases = project?.databases || []
    const deployedNodes = [
      ...allServices.map((s) => ({ id: s.id, type: 'service' as const })),
      ...allDatabases.map((d) => ({ id: d.id, type: 'database' as const })),
    ]

    const networkEdges: Edge<ConnectionEdgeData>[] = []
    for (let i = 0; i < deployedNodes.length; i++) {
      for (let j = i + 1; j < deployedNodes.length; j++) {
        const a = deployedNodes[i]
        const b = deployedNodes[j]
        const pairKey = [a.id, b.id].sort().join('|')

        // Skip if already connected via explicit connection
        if (connectedPairs.has(pairKey)) continue

        // Only create network edges between services and databases (not db-to-db)
        if (a.type === 'database' && b.type === 'database') continue

        // Ensure service is the source
        const source = a.type === 'service' ? a.id : b.id
        const target = a.type === 'service' ? b.id : a.id

        networkEdges.push({
          id: `network-${source}-${target}`,
          source,
          target,
          type: 'connection' as const,
          data: {
            connectionType: 'connects' as const,
            isNetworkEdge: true,
          } as ConnectionEdgeData,
        })
      }
    }

    return [...connectionEdges, ...networkEdges]
  }, [connections, project])

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
      },
    }),
  )

  const deleteConnectionMutation = useMutation(
    trpc.connections.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.connections.listForProject.queryKey({ projectId }),
        })
      },
    }),
  )

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
      const targetType = params.toDatabaseId ? 'database' : 'service'
      createConnectionMutation.mutate({
        fromServiceId: params.fromServiceId,
        toServiceId: params.toServiceId,
        toDatabaseId: params.toDatabaseId,
        targetType,
        connectionType: params.connectionType,
      })
    },
    [createConnectionMutation],
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
      createServiceMutation.mutate({
        projectId,
        name: params.name,
        sourceType: params.sourceType,
        sourceConfig: params.sourceConfig as Parameters<
          typeof createServiceMutation.mutate
        >[0]['sourceConfig'],
      })
    },
    [projectId, createServiceMutation],
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
    (nodeId: string): 'service' | 'database' | null => {
      if (project?.services.some((s) => s.id === nodeId)) {
        return 'service'
      }
      if (project?.databases.some((d) => d.id === nodeId)) {
        return 'database'
      }
      return null
    },
    [project],
  )

  return {
    project,
    nodes,
    edges,
    connections,
    handlePositionChange,
    handleCreateService,
    handleCreateDatabase,
    handleCreateConnection,
    handleDeleteConnection,
    findService,
    findDatabase,
    getNodeType,
    isUpdatingPosition:
      updateServicePositionMutation.isPending || updateDatabasePositionMutation.isPending,
    isCreatingService: createServiceMutation.isPending,
    isCreatingDatabase: createDatabaseMutation.isPending,
    isCreatingConnection: createConnectionMutation.isPending,
    isDeletingConnection: deleteConnectionMutation.isPending,
  }
}
