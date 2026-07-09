import type { Database, Service } from '@mizu/nagare-domain'
import type { Serialized } from '@/shared/api'
import {
  IconApps,
  IconCopy,
  IconDatabase,
  IconEdit,
  IconFocusCentered,
  IconGrid3x3,
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
  IconRocket,
  IconServer,
  IconTerminal,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { useReactFlow } from '@xyflow/react'
import { useEffect, useRef } from 'react'
import type { PropertyAction } from './node-property-editor'
import { useCanvas } from './canvas-provider'

interface CanvasContextMenuProps {
  findService: (id: string) => Serialized<Service> | undefined
  findDatabase: (id: string) => Serialized<Database> | undefined
  onEditProperties: (nodeId: string) => void
  onNodeAction?: (
    nodeId: string,
    nodeType: 'service' | 'database' | null,
    action: PropertyAction,
  ) => void
  serviceGroups?: Array<{ id: string; name: string }>
  getNodeServiceGroupId?: (id: string) => string | null
  onCreateServiceGroup?: (params?: {
    name?: string
    canvasPosition?: { x: number; y: number }
    memberNodeIds?: string[]
  }) => void
  onAssignNodeToServiceGroup?: (nodeId: string, groupId: string | null) => void
  onDeleteServiceGroup?: (groupId: string) => void
  onViewLogs?: (nodeId: string, nodeType: 'service' | 'database') => void
  onAddService: (params: {
    name: string
    sourceType: 'image' | 'git' | 'template'
    sourceConfig: Record<string, unknown>
  }) => void
  onAddDatabase: (params: {
    name: string
    type: 'postgres' | 'mysql' | 'redis' | 'mongodb' | 'mariadb'
    version?: string
  }) => void
}

interface MenuItemProps {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  destructive?: boolean
  disabled?: boolean
}

function MenuItem({ label, icon, onClick, destructive = false, disabled = false }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
        destructive
          ? 'text-red-400 disabled:opacity-50 hover:bg-red-500/10'
          : 'text-neutral-400 disabled:opacity-50 hover:bg-blue-500/10 hover:text-blue-300'
      }`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  )
}

function MenuSeparator() {
  return <div className="my-1 border-t border-blue-500/[0.06]" />
}

export function CanvasContextMenu({
  findService,
  findDatabase,
  onEditProperties,
  onNodeAction,
  serviceGroups = [],
  getNodeServiceGroupId,
  onCreateServiceGroup,
  onAssignNodeToServiceGroup,
  onDeleteServiceGroup,
  onViewLogs,
  onAddService,
  onAddDatabase,
}: CanvasContextMenuProps) {
  const { contextMenu, closeContextMenu, removeNode, addNode, nodes, toggleGrid } = useCanvas()
  const reactFlow = useReactFlow()
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!contextMenu) return

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as globalThis.Node)) {
        closeContextMenu()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeContextMenu()
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [contextMenu, closeContextMenu])

  if (!contextMenu?.visible) return null

  const { position, nodeId, nodeType } = contextMenu
  const isNodeMenu = !!nodeId
  const service = nodeId && nodeType === 'service' ? findService(nodeId) : undefined
  const database = nodeId && nodeType === 'database' ? findDatabase(nodeId) : undefined
  const selectedServiceGroup =
    nodeId && nodeType === 'service-group' ? serviceGroups.find((group) => group.id === nodeId) : null
  const currentGroupId =
    nodeId && (nodeType === 'service' || nodeType === 'database')
      ? (getNodeServiceGroupId?.(nodeId) ?? null)
      : null

  const handleDuplicate = () => {
    if (!nodeId) return
    const originalNode = nodes.find((n) => n.id === nodeId)
    if (!originalNode) return

    const newNode = {
      ...originalNode,
      id: `${originalNode.type}-${Date.now()}`,
      position: {
        x: originalNode.position.x + 50,
        y: originalNode.position.y + 50,
      },
    }
    addNode(newNode)
    closeContextMenu()
  }

  const handleDelete = () => {
    if (nodeId && nodeType === 'service-group' && onDeleteServiceGroup) {
      onDeleteServiceGroup(nodeId)
    } else if (nodeId && onNodeAction && (nodeType === 'service' || nodeType === 'database')) {
      onNodeAction(nodeId, nodeType, { type: 'delete' })
    } else if (nodeId) {
      removeNode(nodeId)
    }
    closeContextMenu()
  }

  const handleFitView = () => {
    reactFlow.fitView({ padding: 0.2, maxZoom: 1.5 })
    closeContextMenu()
  }

  // Clamp position to prevent menu from going off-screen
  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x, window.innerWidth - 220),
    top: Math.min(position.y, window.innerHeight - 300),
    zIndex: 50,
  }

  return (
    <div
      ref={menuRef}
      style={menuStyle}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="w-52 rounded-xl border border-blue-500/10 bg-black/95 p-1.5 shadow-2xl shadow-black/60 backdrop-blur-md"
    >
      {isNodeMenu ? (
        <>
          {/* Node header */}
          <div className="mb-1 px-2 py-1">
            <div className="text-[10px] text-neutral-600">
              {nodeType === 'service'
                ? service?.name ?? 'service'
                : nodeType === 'service-group'
                  ? selectedServiceGroup?.name ?? 'service group'
                : database?.name ?? nodeType ?? 'node'}
            </div>
          </div>

          {nodeType !== 'service-group' && (
            <>
              <MenuItem
                label="Edit Properties"
                icon={<IconEdit className="size-3" />}
                onClick={() => {
                  if (nodeId) onEditProperties(nodeId)
                  closeContextMenu()
                }}
              />
              <MenuItem
                label="Duplicate"
                icon={<IconCopy className="size-3" />}
                onClick={handleDuplicate}
              />
            </>
          )}

          {/* Service/database specific actions */}
          {(nodeType === 'service' || nodeType === 'database') && (
            <>
              <MenuSeparator />
              <MenuItem
                label="Deploy"
                icon={<IconRocket className="size-3" />}
                onClick={() => {
                  if (nodeId && onNodeAction)
                    onNodeAction(nodeId, nodeType as 'service' | 'database', { type: 'deploy' })
                  closeContextMenu()
                }}
              />
              <MenuItem
                label="Start"
                icon={<IconPlayerPlay className="size-3" />}
                onClick={() => {
                  if (nodeId && onNodeAction)
                    onNodeAction(nodeId, nodeType as 'service' | 'database', { type: 'start' })
                  closeContextMenu()
                }}
              />
              <MenuItem
                label="Stop"
                icon={<IconPlayerStop className="size-3" />}
                onClick={() => {
                  if (nodeId && onNodeAction)
                    onNodeAction(nodeId, nodeType as 'service' | 'database', { type: 'stop' })
                  closeContextMenu()
                }}
              />
              <MenuItem
                label="Restart"
                icon={<IconRefresh className="size-3" />}
                onClick={() => {
                  if (nodeId && onNodeAction)
                    onNodeAction(nodeId, nodeType as 'service' | 'database', { type: 'restart' })
                  closeContextMenu()
                }}
              />
              <MenuItem
                label="View Logs"
                icon={<IconTerminal className="size-3" />}
                onClick={() => {
                  if (nodeId && onViewLogs)
                    onViewLogs(nodeId, nodeType as 'service' | 'database')
                  closeContextMenu()
                }}
              />
            </>
          )}

          {/* Service group actions for service/database nodes */}
          {(nodeType === 'service' || nodeType === 'database') &&
            onAssignNodeToServiceGroup &&
            onCreateServiceGroup && (
              <>
                <MenuSeparator />
                <div className="px-2.5 py-1 text-[10px] text-neutral-600">service groups</div>
                <MenuItem
                  label="Create Group from Node"
                  icon={<IconApps className="size-3" />}
                  onClick={() => {
                    if (!nodeId) return
                    onCreateServiceGroup({
                      memberNodeIds: [nodeId],
                    })
                    closeContextMenu()
                  }}
                />
                {serviceGroups.map((group) => (
                  <MenuItem
                    key={group.id}
                    label={currentGroupId === group.id ? `In ${group.name}` : `Move to ${group.name}`}
                    icon={<IconApps className="size-3" />}
                    disabled={currentGroupId === group.id}
                    onClick={() => {
                      if (!nodeId) return
                      onAssignNodeToServiceGroup(nodeId, group.id)
                      closeContextMenu()
                    }}
                  />
                ))}
                {currentGroupId && (
                  <MenuItem
                    label="Remove from Group"
                    icon={<IconX className="size-3" />}
                    onClick={() => {
                      if (!nodeId) return
                      onAssignNodeToServiceGroup(nodeId, null)
                      closeContextMenu()
                    }}
                  />
                )}
              </>
            )}

          <MenuSeparator />
          <MenuItem
            label={nodeType === 'service-group' ? 'Delete Group' : 'Delete'}
            icon={<IconTrash className="size-3" />}
            onClick={handleDelete}
            destructive
          />
        </>
      ) : (
        <>
          {/* Pane context menu */}
          <div className="mb-1 px-2 py-1">
            <div className="text-[10px] text-neutral-600">$ add component</div>
          </div>

          <MenuItem
            label="Add Service"
            icon={<IconServer className="size-3" />}
            onClick={() => {
              onAddService({
                name: 'New Service',
                sourceType: 'image',
                sourceConfig: { image: 'nginx', tag: 'latest' },
              })
              closeContextMenu()
            }}
          />
          <MenuItem
            label="Add Database"
            icon={<IconDatabase className="size-3" />}
            onClick={() => {
              onAddDatabase({
                name: 'New Database',
                type: 'postgres',
                version: '16',
              })
              closeContextMenu()
            }}
          />
          {onCreateServiceGroup && (
            <MenuItem
              label="Add Service Group"
              icon={<IconApps className="size-3" />}
              onClick={() => {
                const flowPosition = reactFlow.screenToFlowPosition(position)
                onCreateServiceGroup({ canvasPosition: flowPosition })
                closeContextMenu()
              }}
            />
          )}

          <MenuSeparator />
          <MenuItem
            label="Fit View"
            icon={<IconFocusCentered className="size-3" />}
            onClick={handleFitView}
          />
          <MenuItem
            label="Toggle Grid"
            icon={<IconGrid3x3 className="size-3" />}
            onClick={() => {
              toggleGrid()
              closeContextMenu()
            }}
          />
        </>
      )}
    </div>
  )
}
