import { IconApps, IconCopy, IconEdit, IconTerminal, IconTrash, IconX } from '@tabler/icons-react'
import { useCanvas } from '@/components/canvas/canvas-provider'
import { MenuItem, MenuSeparator } from './canvas-context-menu-item'
import type { CanvasContextMenuNodeSectionProps } from './lib/types'
import { NODE_LIFECYCLE_ACTIONS } from './lib/values'

export function CanvasContextMenuNodeSection({
  nodeId,
  nodeType,
  findService,
  findDatabase,
  onEditProperties,
  onNodeAction,
  serviceGroups,
  getNodeServiceGroupId,
  onCreateServiceGroup,
  onAssignNodeToServiceGroup,
  onDeleteServiceGroup,
  onViewLogs,
}: CanvasContextMenuNodeSectionProps) {
  const { nodes, addNode, removeNode, closeContextMenu } = useCanvas()

  const service = nodeType === 'service' ? findService(nodeId) : undefined
  const database = nodeType === 'database' ? findDatabase(nodeId) : undefined
  const selectedServiceGroup =
    nodeType === 'service-group' ? serviceGroups.find((group) => group.id === nodeId) : null
  const currentGroupId =
    nodeType === 'service' || nodeType === 'database'
      ? (getNodeServiceGroupId?.(nodeId) ?? null)
      : null

  const handleDuplicate = () => {
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
    if (nodeType === 'service-group' && onDeleteServiceGroup) {
      onDeleteServiceGroup(nodeId)
    } else if (onNodeAction && (nodeType === 'service' || nodeType === 'database')) {
      onNodeAction(nodeId, nodeType, { type: 'delete' })
    } else {
      removeNode(nodeId)
    }
    closeContextMenu()
  }

  return (
    <>
      {/* Node header */}
      <div className="mb-1 px-2 py-1">
        <div className="text-[10px] text-neutral-600">
          {nodeType === 'service'
            ? (service?.name ?? 'service')
            : nodeType === 'service-group'
              ? (selectedServiceGroup?.name ?? 'service group')
              : (database?.name ?? nodeType ?? 'node')}
        </div>
      </div>

      {nodeType !== 'service-group' && (
        <>
          <MenuItem
            label="Edit Properties"
            icon={<IconEdit className="size-3" />}
            onClick={() => {
              onEditProperties(nodeId)
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
          {NODE_LIFECYCLE_ACTIONS.map((action) => (
            <MenuItem
              key={action.actionType}
              label={action.label}
              icon={<action.icon className="size-3" />}
              onClick={() => {
                if (onNodeAction)
                  onNodeAction(nodeId, nodeType as 'service' | 'database', {
                    type: action.actionType,
                  })
                closeContextMenu()
              }}
            />
          ))}
          <MenuItem
            label="View Logs"
            icon={<IconTerminal className="size-3" />}
            onClick={() => {
              if (onViewLogs) onViewLogs(nodeId, nodeType as 'service' | 'database')
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
  )
}
