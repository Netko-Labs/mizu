import {
  IconApps,
  IconDatabase,
  IconFocusCentered,
  IconGrid3x3,
  IconServer,
} from '@tabler/icons-react'
import { useReactFlow } from '@xyflow/react'
import { useCanvas } from '@/components/canvas/canvas-provider'
import { MenuItem, MenuSeparator } from './canvas-context-menu-item'
import type { CanvasContextMenuPaneSectionProps } from './lib/types'
import { NEW_DATABASE_PRESET, NEW_SERVICE_PRESET } from './lib/values'

export function CanvasContextMenuPaneSection({
  position,
  onAddService,
  onAddDatabase,
  onCreateServiceGroup,
}: CanvasContextMenuPaneSectionProps) {
  const { toggleGrid, closeContextMenu } = useCanvas()
  const reactFlow = useReactFlow()

  const handleFitView = () => {
    reactFlow.fitView({ padding: 0.2, maxZoom: 1.5 })
    closeContextMenu()
  }

  return (
    <>
      {/* Pane context menu */}
      <div className="mb-1 px-2 py-1">
        <div className="text-[10px] text-neutral-600">$ add component</div>
      </div>

      <MenuItem
        label="Add Service"
        icon={<IconServer className="size-3" />}
        onClick={() => {
          onAddService(NEW_SERVICE_PRESET)
          closeContextMenu()
        }}
      />
      <MenuItem
        label="Add Database"
        icon={<IconDatabase className="size-3" />}
        onClick={() => {
          onAddDatabase(NEW_DATABASE_PRESET)
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
  )
}
