import { useQuery } from '@tanstack/react-query'
import type { Node } from '@xyflow/react'
import { useCallback } from 'react'
import { useProjectCanvas } from '@/components/canvas/lib'
import { projectQueries } from '@/shared/api'
import { useCanvasOverlays } from './use-canvas-overlays'
import { useNodeActions } from './use-node-actions'

/**
 * Orchestrator for the project canvas view: canvas data + node actions +
 * overlay state + drag/resize handlers, composed so the view component stays
 * within its hook budget.
 */
export function useCanvasView(projectId: string, environmentId?: string) {
  const canvas = useProjectCanvas(projectId, environmentId)
  const overlays = useCanvasOverlays()
  const { handleNodeAction, isActionPending } = useNodeActions(projectId, () =>
    overlays.setSelectedNodeId(null),
  )

  const { data: generatedFiles } = useQuery(projectQueries.generatedFiles(projectId))

  const {
    serviceGroups,
    handlePositionChange,
    handleMoveServiceGroup,
    handleResizeServiceGroup,
    getNodeType,
    getNodeServiceGroupId,
    findService,
    findDatabase,
  } = canvas

  const handleNodeSelect = useCallback(
    (nodeId: string | null) => {
      overlays.setSelectedNodeId(nodeId)
    },
    [overlays.setSelectedNodeId],
  )

  const handleNodeDragStop = useCallback(
    (node: Node) => {
      const nodeType = getNodeType(node.id)
      const maybeAbsolute = (node as Node & { positionAbsolute?: { x: number; y: number } })
        .positionAbsolute
      const groupId = getNodeServiceGroupId(node.id)
      const parentGroup = groupId ? serviceGroups.find((group) => group.id === groupId) : null
      const absolutePosition =
        maybeAbsolute ??
        (parentGroup
          ? {
              x: node.position.x + parentGroup.canvasPosition.x,
              y: node.position.y + parentGroup.canvasPosition.y,
            }
          : node.position)

      if (nodeType === 'service' || nodeType === 'database') {
        handlePositionChange(node.id, absolutePosition)
      }
      if (nodeType === 'service-group') {
        handleMoveServiceGroup(node.id, absolutePosition)
      }
    },
    [
      getNodeType,
      getNodeServiceGroupId,
      handlePositionChange,
      handleMoveServiceGroup,
      serviceGroups,
    ],
  )

  const handleNodesUpdate = useCallback(
    (updatedNodes: Node[]) => {
      for (const node of updatedNodes) {
        if (node.type !== 'service-group') {
          continue
        }
        const group = serviceGroups.find((entry) => entry.id === node.id)
        if (!group) {
          continue
        }

        const style = node.style as Record<string, unknown> | undefined
        const width =
          typeof node.width === 'number'
            ? node.width
            : typeof style?.width === 'number'
              ? style.width
              : null
        const height =
          typeof node.height === 'number'
            ? node.height
            : typeof style?.height === 'number'
              ? style.height
              : null

        if (width == null || height == null) {
          continue
        }

        if (Math.round(width) !== group.size.width || Math.round(height) !== group.size.height) {
          handleResizeServiceGroup(node.id, { width, height })
        }
      }
    },
    [serviceGroups, handleResizeServiceGroup],
  )

  const selectedNodeType = overlays.selectedNodeId ? getNodeType(overlays.selectedNodeId) : null
  const actionableSelectedNodeType = selectedNodeType === 'service-group' ? null : selectedNodeType

  const selectedService =
    overlays.selectedNodeId && selectedNodeType === 'service'
      ? (findService(overlays.selectedNodeId) ?? null)
      : null

  const selectedDatabase =
    overlays.selectedNodeId && selectedNodeType === 'database'
      ? (findDatabase(overlays.selectedNodeId) ?? null)
      : null

  return {
    canvas,
    overlays,
    generatedFiles,
    handleNodeAction,
    isActionPending,
    handleNodeSelect,
    handleNodeDragStop,
    handleNodesUpdate,
    actionableSelectedNodeType,
    selectedService,
    selectedDatabase,
  }
}
