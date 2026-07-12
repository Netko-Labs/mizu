import type { Database, Service } from '@mizu/nagare-domain'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { Edge, Node } from '@xyflow/react'
import { useCallback, useMemo } from 'react'
import type { ConnectionEdgeData } from '@/components/canvas/edges/connection-edge'
import type { DatabaseNodeData } from '@/components/canvas/nodes/database-node'
import type { ServiceGroupNodeData } from '@/components/canvas/nodes/service-group-node'
import type { ServiceNodeData } from '@/components/canvas/nodes/service-node'
import { connectionQueries, projectQueries, type Serialized } from '@/shared/api'
import {
  DATABASE_NODE_HEIGHT,
  DATABASE_NODE_WIDTH,
  SERVICE_NODE_HEIGHT,
  SERVICE_NODE_WIDTH,
} from '../constants'
import type { CanvasServiceGroup, UseCanvasGraphParams } from '../types'
import { clampNodeToGroupBounds, parseEntityCanvasPosition } from '../utils'

/**
 * Fetches the project (with services and databases) and its connections,
 * plus entity lookups on the fetched data.
 */
export function useCanvasEntities(projectId: string, environmentId?: string) {
  // Fetch the active environment's services and databases (poll every 5s for
  // status updates)
  const { data: project } = useSuspenseQuery({
    ...projectQueries.withServices(projectId, environmentId),
    refetchInterval: 5000,
  })

  // Fetch connections for the project
  const { data: connections } = useSuspenseQuery(connectionQueries.forProject(projectId))

  /**
   * Find a service by ID from the project data.
   */
  const findService = useCallback(
    (serviceId: string): Serialized<Service> | undefined => {
      return project?.services.find((s) => s.id === serviceId)
    },
    [project],
  )

  /**
   * Find a database by ID from the project data.
   */
  const findDatabase = useCallback(
    (databaseId: string): Serialized<Database> | undefined => {
      return project?.databases.find((d) => d.id === databaseId)
    },
    [project],
  )

  return { project, connections, findService, findDatabase }
}

/**
 * Converts entities and service groups into React Flow nodes/edges,
 * plus group-aware node lookups.
 */
export function useCanvasGraph({ project, connections, serviceGroups }: UseCanvasGraphParams) {
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

  return { nodes, edges, getNodeType, findServiceGroup, getNodeServiceGroupId }
}
