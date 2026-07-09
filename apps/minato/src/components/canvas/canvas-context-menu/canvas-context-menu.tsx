import type { CSSProperties } from 'react'
import { useCanvas } from '@/components/canvas/canvas-provider'
import { CanvasContextMenuNodeSection } from './canvas-context-menu-node-section'
import { CanvasContextMenuPaneSection } from './canvas-context-menu-pane-section'
import { useContextMenuDismiss } from './lib/hooks/use-context-menu-dismiss'
import type { CanvasContextMenuProps } from './lib/types'

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
  const { contextMenu, closeContextMenu } = useCanvas()
  const menuRef = useContextMenuDismiss(contextMenu, closeContextMenu)

  if (!contextMenu?.visible) return null

  const { position, nodeId, nodeType } = contextMenu

  // Clamp position to prevent menu from going off-screen
  const menuStyle: CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x, window.innerWidth - 220),
    top: Math.min(position.y, window.innerHeight - 300),
    zIndex: 50,
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the wrapper only stops event propagation for the floating menu
    <div
      ref={menuRef}
      style={menuStyle}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="w-52 rounded-xl border border-blue-500/10 bg-black/95 p-1.5 shadow-2xl shadow-black/60 backdrop-blur-md"
    >
      {nodeId ? (
        <CanvasContextMenuNodeSection
          nodeId={nodeId}
          nodeType={nodeType}
          findService={findService}
          findDatabase={findDatabase}
          onEditProperties={onEditProperties}
          onNodeAction={onNodeAction}
          serviceGroups={serviceGroups}
          getNodeServiceGroupId={getNodeServiceGroupId}
          onCreateServiceGroup={onCreateServiceGroup}
          onAssignNodeToServiceGroup={onAssignNodeToServiceGroup}
          onDeleteServiceGroup={onDeleteServiceGroup}
          onViewLogs={onViewLogs}
        />
      ) : (
        <CanvasContextMenuPaneSection
          position={position}
          onAddService={onAddService}
          onAddDatabase={onAddDatabase}
          onCreateServiceGroup={onCreateServiceGroup}
        />
      )}
    </div>
  )
}
