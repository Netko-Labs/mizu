'use client'

import { IconLayoutSidebarRight, IconLayoutSidebarRightCollapse } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { cn } from '@/lib/utils'
import { CanvasEditor, type CanvasEditorProps } from './canvas-editor'
import { YamlPreviewPanel } from './yaml-preview'

interface CanvasLayoutProps extends Omit<CanvasEditorProps, 'panelContent'> {
  /** Docker Compose YAML content */
  dockerComposeYaml?: string
  /** Mizu YAML content */
  mizuYaml?: string
  /** Callback when export is requested */
  onExport?: () => void
  /** Whether to show the YAML preview panel initially */
  showPreviewInitially?: boolean
  /** Additional class names */
  className?: string
}

/**
 * Canvas layout with resizable split view.
 *
 * Left panel: CanvasEditor (main canvas)
 * Right panel: YamlPreviewPanel (docker-compose.yml / mizu.yml preview)
 */
export function CanvasLayout({
  dockerComposeYaml = '',
  mizuYaml = '',
  onExport,
  showPreviewInitially = true,
  className,
  ...canvasProps
}: CanvasLayoutProps) {
  const [showPreview, setShowPreview] = useState(showPreviewInitially)

  // Toolbar button to toggle preview panel
  const toolbarContent = useMemo(
    () => (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPreview((prev) => !prev)}
        className="h-8"
      >
        {showPreview ? (
          <>
            <IconLayoutSidebarRightCollapse className="mr-1 size-4" />
            Hide YAML
          </>
        ) : (
          <>
            <IconLayoutSidebarRight className="mr-1 size-4" />
            Show YAML
          </>
        )}
      </Button>
    ),
    [showPreview],
  )

  return (
    <div className={cn('h-full w-full', className)}>
      <ResizablePanelGroup className="h-full">
        {/* Canvas panel */}
        <ResizablePanel defaultSize={showPreview ? 70 : 100} minSize={50}>
          <CanvasEditor {...canvasProps} panelContent={toolbarContent} />
        </ResizablePanel>

        {/* Resizable handle + Preview panel */}
        {showPreview && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
              <YamlPreviewPanel
                dockerComposeYaml={dockerComposeYaml}
                mizuYaml={mizuYaml}
                onExport={onExport}
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}
