import type { Connection, Edge, OnConnect, OnEdgesDelete } from '@xyflow/react'
import { useCallback } from 'react'
import { useCanvas } from '@/components/canvas/canvas-provider'
import type { PersistedConnection, UseCanvasConnectParams } from '../types'

export function useCanvasConnect({
  onCreateConnection,
  onDeleteConnection,
}: UseCanvasConnectParams) {
  const { nodes, edges, addEdge: addCanvasEdge } = useCanvas()

  // Handle new connection
  const handleConnect: OnConnect = useCallback(
    (params) => {
      if (!params.source || !params.target) {
        return
      }

      const sourceNode = nodes.find((node) => node.id === params.source)
      const targetNode = nodes.find((node) => node.id === params.target)
      if (!sourceNode || !targetNode) {
        return
      }

      let normalized: PersistedConnection | null = null

      if (sourceNode.type === 'service' && targetNode.type === 'service') {
        normalized = {
          edgeSource: params.source,
          edgeTarget: params.target,
          fromServiceId: params.source,
          toServiceId: params.target,
        }
      } else if (sourceNode.type === 'service' && targetNode.type === 'database') {
        normalized = {
          edgeSource: params.source,
          edgeTarget: params.target,
          fromServiceId: params.source,
          toDatabaseId: params.target,
        }
      } else if (sourceNode.type === 'database' && targetNode.type === 'service') {
        // Dependencies are persisted as "service depends on database".
        // If user drags from DB -> service, normalize to the same semantic edge.
        normalized = {
          edgeSource: params.target,
          edgeTarget: params.source,
          fromServiceId: params.target,
          toDatabaseId: params.source,
        }
      }

      if (!normalized) {
        return
      }

      const hasConnection = edges.some(
        (edge) => edge.source === normalized.edgeSource && edge.target === normalized.edgeTarget,
      )
      if (hasConnection) {
        return
      }

      addCanvasEdge({
        id: `service-connection-local-${normalized.edgeSource}-${normalized.edgeTarget}-${Date.now()}`,
        source: normalized.edgeSource,
        target: normalized.edgeTarget,
        sourceHandle: undefined,
        targetHandle: undefined,
        type: 'connection',
        data: {
          connectionType: 'depends',
        },
      })

      if (onCreateConnection) {
        onCreateConnection({
          fromServiceId: normalized.fromServiceId,
          toServiceId: normalized.toServiceId,
          toDatabaseId: normalized.toDatabaseId,
          connectionType: 'depends',
        })
        return
      }
    },
    [addCanvasEdge, edges, nodes, onCreateConnection],
  )

  const handleEdgesDelete: OnEdgesDelete = useCallback(
    (deletedEdges) => {
      if (!onDeleteConnection) {
        return
      }
      for (const edge of deletedEdges) {
        if (edge.id.startsWith('service-connection-local-')) {
          continue
        }
        onDeleteConnection(edge.id)
      }
    },
    [onDeleteConnection],
  )

  // Connection validation: only services can be sources, no self-connections
  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      if (connection.source === connection.target) return false
      const sourceNode = nodes.find((n) => n.id === connection.source)
      const targetNode = nodes.find((n) => n.id === connection.target)
      if (!sourceNode || !targetNode) {
        return false
      }

      if (sourceNode.type === 'service') {
        return targetNode.type === 'service' || targetNode.type === 'database'
      }

      if (sourceNode.type === 'database') {
        return targetNode.type === 'service'
      }

      return false
    },
    [nodes],
  )

  return { handleConnect, handleEdgesDelete, isValidConnection }
}
