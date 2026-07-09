import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  DATABASE_NODE_HEIGHT,
  DATABASE_NODE_WIDTH,
  DEFAULT_GROUP_HEIGHT,
  DEFAULT_GROUP_WIDTH,
  GROUP_MIN_HEIGHT,
  GROUP_MIN_WIDTH,
  GROUP_RESIZE_UPDATE_DEBOUNCE,
  SERVICE_NODE_HEIGHT,
  SERVICE_NODE_WIDTH,
} from '../constants'
import type {
  CanvasPosition,
  CanvasServiceGroup,
  CanvasSize,
  CreateServiceGroupParams,
  ProjectSettingsShape,
  UseServiceGroupsParams,
} from '../types'
import {
  clampAbsolutePositionToGroup,
  parsePosition,
  parseServiceGroups,
  parseSettingsValue,
} from '../utils'

/**
 * Service groups persisted in project settings: parsing, persistence, and group handlers.
 */
export function useServiceGroups({ projectId, project, mutations }: UseServiceGroupsParams) {
  const { updateProjectMutation, updateServicePositionMutation, updateDatabasePositionMutation } =
    mutations

  // Debounce timers for group resize updates
  const groupResizeTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    return () => {
      for (const timer of groupResizeTimers.current.values()) {
        clearTimeout(timer)
      }
      groupResizeTimers.current.clear()
    }
  }, [])

  const serviceGroups = useMemo(() => parseServiceGroups(project?.settings), [project?.settings])

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

  /**
   * Create a service group, optionally with member nodes.
   */
  const handleCreateServiceGroup = useCallback(
    (params?: CreateServiceGroupParams) => {
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
            updateServicePositionMutation.mutate({
              serviceId: nodeId,
              position: clampAbsolutePositionToGroup(absolutePosition, targetGroup, {
                width: SERVICE_NODE_WIDTH,
                height: SERVICE_NODE_HEIGHT,
              }),
            })
          }

          const database = project?.databases.find((entry) => entry.id === nodeId)
          if (database) {
            const absolutePosition = parsePosition(database.canvasPosition, { x: 100, y: 300 })
            updateDatabasePositionMutation.mutate({
              databaseId: nodeId,
              position: clampAbsolutePositionToGroup(absolutePosition, targetGroup, {
                width: DATABASE_NODE_WIDTH,
                height: DATABASE_NODE_HEIGHT,
              }),
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
    (groupId: string, size: CanvasSize) => {
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

  return {
    serviceGroups,
    updateServiceGroups,
    handleCreateServiceGroup,
    handleAssignNodeToServiceGroup,
    handleDeleteServiceGroup,
    handleMoveServiceGroup,
    handleResizeServiceGroup,
  }
}
