import { IconDatabase, IconServer } from '@tabler/icons-react'
import {
  Background,
  BackgroundVariant,
  type ColorMode,
  ConnectionMode,
  Controls,
  Panel,
  ReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useCanvas } from '@/components/canvas/canvas-provider'
import { ConnectionEdgeMarkers } from '@/components/canvas/edges/connection-edge'
import { ConnectionPreviewLine } from '@/components/canvas/edges/connection-preview-line'
import { cn } from '@/lib/utils'
import {
  type CanvasEditorProps,
  defaultEdgeOptions,
  edgeTypes,
  nodeTypes,
  useCanvasConnect,
  useCanvasDnd,
  useCanvasInteractions,
} from './lib'

export type { CanvasEditorProps } from './lib'

export function CanvasEditor({
  onNodeSelect,
  onEdgeSelect,
  onAddService,
  onAddDatabase,
  onCreateConnection,
  onDeleteConnection,
  onNodeDragStop,
  className,
  showControls = true,
  showBackground = true,
  panelContent,
}: CanvasEditorProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, showGrid } = useCanvas()
  const { reactFlowWrapper, handleInit, handleDragOver, handleDrop } = useCanvasDnd({
    onAddService,
    onAddDatabase,
  })
  const { handleConnect, handleEdgesDelete, isValidConnection } = useCanvasConnect({
    onCreateConnection,
    onDeleteConnection,
  })
  const {
    handleNodeClick,
    handleEdgeClick,
    handlePaneClick,
    handleNodeContextMenu,
    handlePaneContextMenu,
  } = useCanvasInteractions({ onNodeSelect, onEdgeSelect })

  return (
    <div ref={reactFlowWrapper} className={cn('h-full w-full', className)}>
      {/* SVG markers for edges */}
      <ConnectionEdgeMarkers />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onEdgesDelete={handleEdgesDelete}
        onNodeDragStop={(_event, node) => onNodeDragStop?.(node)}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        onNodeContextMenu={handleNodeContextMenu}
        onPaneContextMenu={handlePaneContextMenu}
        onInit={handleInit}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        isValidConnection={isValidConnection}
        connectionMode={ConnectionMode.Loose}
        connectionRadius={28}
        connectionLineComponent={ConnectionPreviewLine}
        connectionLineContainerStyle={{ zIndex: 1200 }}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{
          padding: 0.3,
          maxZoom: 1.2,
        }}
        snapToGrid
        snapGrid={[20, 20]}
        minZoom={0.1}
        maxZoom={2}
        attributionPosition="bottom-left"
        colorMode={'dark' as ColorMode}
        proOptions={{ hideAttribution: true }}
        style={{ '--xy-background-color': '#000000' } as React.CSSProperties}
        className="!bg-black [&_.react-flow__edgelabel-renderer]:z-[90]"
      >
        {/* Background with dotted grid */}
        {showBackground && showGrid && (
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={2}
            color="rgba(255,255,255,0.3)"
          />
        )}

        {/* Controls panel */}
        {showControls && (
          <Controls
            showZoom
            showFitView
            showInteractive
            position="bottom-left"
            className="!rounded-xl !border-blue-500/10 !bg-black !shadow-xl !shadow-black/50 [&>button]:!rounded-lg [&>button]:!border-blue-500/[0.06] [&>button]:!bg-transparent [&>button]:hover:!bg-blue-500/10 [&>button]:!text-neutral-500 [&>button]:hover:!text-blue-400 [&>button]:!transition-colors"
          />
        )}

        {/* MiniMap removed — user preference */}

        <Panel position="top-left" className="m-2">
          <div className="rounded-md border border-blue-500/10 bg-black/85 px-2.5 py-1 text-[10px] text-neutral-500 backdrop-blur">
            common project network enabled
          </div>
        </Panel>

        {/* Custom panel for toolbar or other content */}
        {panelContent && (
          <Panel position="top-right" className="m-2">
            {panelContent}
          </Panel>
        )}

        {/* Empty state */}
        {nodes.length === 0 && (
          <Panel position="top-center" className="!top-1/2 !-translate-y-1/2">
            <div className="pointer-events-none select-none text-center">
              <div className="flex items-center justify-center gap-4 text-blue-500/30">
                <IconServer className="size-6" />
                <span className="text-2xl text-blue-500/20">/</span>
                <IconDatabase className="size-6" />
              </div>
              <p className="mt-4 text-sm text-neutral-600">
                Right-click or drag from sidebar to add components
              </p>
              <p className="mt-1.5 text-xs text-neutral-700">Build your architecture visually</p>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}
