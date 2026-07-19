import { DEFAULT_GROUP_HEIGHT, DEFAULT_GROUP_WIDTH, GROUP_NODE_PADDING } from './constants'
import type { CanvasPosition, CanvasServiceGroup, CanvasSize } from './types'

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseSettingsValue(value: unknown): Record<string, unknown> {
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

export function parsePosition(value: unknown, fallback: CanvasPosition): CanvasPosition {
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

export function parseEntityCanvasPosition(
  value: unknown,
  fallback: CanvasPosition,
): CanvasPosition {
  const parsed = parsePosition(value, fallback)
  // Historical rows can be persisted with the DB default origin.
  // Treat this as "unset" to avoid node overlap in the canvas.
  if (parsed.x === 0 && parsed.y === 0) {
    return fallback
  }
  return parsed
}

export function parseGroupSize(
  value: unknown,
  fallback = { width: DEFAULT_GROUP_WIDTH, height: DEFAULT_GROUP_HEIGHT },
) {
  if (isRecord(value) && typeof value.width === 'number' && typeof value.height === 'number') {
    return { width: value.width, height: value.height }
  }
  return fallback
}

export function clampNodeToGroupBounds(
  relativePosition: CanvasPosition,
  groupSize: CanvasSize,
  nodeSize: CanvasSize,
): CanvasPosition {
  const maxX = Math.max(GROUP_NODE_PADDING, groupSize.width - nodeSize.width - GROUP_NODE_PADDING)
  const maxY = Math.max(GROUP_NODE_PADDING, groupSize.height - nodeSize.height - GROUP_NODE_PADDING)

  return {
    x: Math.min(Math.max(relativePosition.x, GROUP_NODE_PADDING), maxX),
    y: Math.min(Math.max(relativePosition.y, GROUP_NODE_PADDING), maxY),
  }
}

/**
 * Clamp an absolute canvas position into a group's padded bounds,
 * returning the equivalent absolute position.
 */
export function clampAbsolutePositionToGroup(
  absolutePosition: CanvasPosition,
  group: CanvasServiceGroup,
  nodeSize: CanvasSize,
): CanvasPosition {
  const relative = clampNodeToGroupBounds(
    {
      x: absolutePosition.x - group.canvasPosition.x,
      y: absolutePosition.y - group.canvasPosition.y,
    },
    group.size,
    nodeSize,
  )
  return {
    x: group.canvasPosition.x + relative.x,
    y: group.canvasPosition.y + relative.y,
  }
}

export function parseServiceGroups(settings: unknown): CanvasServiceGroup[] {
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

/** Compact relative time: "just now", "4m ago", "2h ago", "3d ago". */
export function formatRelativeTime(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}
