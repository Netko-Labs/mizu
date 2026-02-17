import { IconDatabase, IconServer } from '@tabler/icons-react'
import {
  Background,
  BackgroundVariant,
  type ColorMode,
  type Connection,
  ConnectionMode,
  Controls,
  type Edge,
  type EdgeTypes,
  type Node,
  type NodeTypes,
  type OnConnect,
  type OnEdgesDelete,
  Panel,
  ReactFlow,
  type ReactFlowInstance,
} from '@xyflow/react'
import { type DragEvent, useCallback, useRef } from 'react'
import '@xyflow/react/dist/style.css'
import { cn } from '@/lib/utils'
import { useCanvas } from './canvas-provider'
import { ConnectionEdge, ConnectionEdgeMarkers } from './edges/connection-edge'
import { DatabaseNode } from './nodes/database-node'
import { ExternalServiceNode } from './nodes/external-service-node'
import { NetworkNode } from './nodes/network-node'
import { SecretNode } from './nodes/secret-node'
import { ServiceNode } from './nodes/service-node'
import { ServiceGroupNode } from './nodes/service-group-node'
import { VolumeNode } from './nodes/volume-node'

const nodeTypes: NodeTypes = {
  'service-group': ServiceGroupNode,
  service: ServiceNode,
  database: DatabaseNode,
  volume: VolumeNode,
  network: NetworkNode,
  secret: SecretNode,
  external: ExternalServiceNode,
}

const edgeTypes: EdgeTypes = {
  connection: ConnectionEdge,
}

/** Default edge options for new connections */
const defaultEdgeOptions = {
  type: 'connection',
  animated: false,
}

export interface CanvasEditorProps {
  /** Callback when a node is selected */
  onNodeSelect?: (nodeId: string | null) => void
  /** Callback when an edge is selected */
  onEdgeSelect?: (edgeId: string | null) => void
  /** Callback to create a service via backend */
  onAddService?: (params: {
    name: string
    sourceType: 'image' | 'git' | 'template'
    sourceConfig: Record<string, unknown>
  }) => void
  /** Callback to create a database via backend */
  onAddDatabase?: (params: {
    name: string
    type: 'postgres' | 'mysql' | 'redis' | 'mongodb' | 'mariadb'
    version?: string
  }) => void
  /** Callback to persist a new service dependency edge */
  onCreateConnection?: (params: {
    fromServiceId: string
    toServiceId?: string
    toDatabaseId?: string
    connectionType: 'depends'
  }) => void
  /** Callback to delete a persisted connection edge */
  onDeleteConnection?: (connectionId: string) => void
  /** Callback when node drag stops (for position persistence) */
  onNodeDragStop?: (node: Node) => void
  /** Additional class names for the container */
  className?: string
  /** Whether to show the controls */
  showControls?: boolean
  /** Whether to show the background grid */
  showBackground?: boolean
  /** Custom panel content (e.g., for toolbar) */
  panelContent?: React.ReactNode
}

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
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null)
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setSelectedNodeId,
    setSelectedEdgeId,
    clearSelection,
    addEdge: addCanvasEdge,
    openContextMenu,
    closeContextMenu,
    showGrid,
  } = useCanvas()

  // Handle ReactFlow initialization
  const handleInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance
  }, [])

  // Handle drag over to allow drop
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  // Handle drop from sidebar
  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()

      const type = e.dataTransfer.getData('application/reactflow-type')
      const dataStr = e.dataTransfer.getData('application/reactflow-data')

      if (!type || !dataStr) {
        return
      }

      const dropData = JSON.parse(dataStr)

      if (type === 'service' && onAddService) {
        const sourceType = dropData.sourceType || 'image'
        let sourceConfig: Record<string, unknown>
        if (sourceType === 'template') {
          sourceConfig = {
            templateId: dropData.templateId || 'custom',
            overrides: {},
            _createAsGroup: dropData.createAsGroup === true,
          }
        } else if (sourceType === 'git') {
          sourceConfig = { repository: 'https://github.com/example/repo' }
        } else {
          sourceConfig = { image: 'nginx', tag: 'latest' }
        }
        onAddService({
          name: dropData.name || 'New Service',
          sourceType,
          sourceConfig,
        })
      } else if (type === 'database' && onAddDatabase) {
        onAddDatabase({
          name: dropData.name || 'New Database',
          type: dropData.databaseType || 'postgres',
          version: dropData.version,
        })
      }
      // Volume, network, secret, external types don't have backend mutations yet
    },
    [onAddService, onAddDatabase],
  )

  // Handle node click
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id)
      setSelectedEdgeId(null)
      onNodeSelect?.(node.id)
    },
    [setSelectedNodeId, setSelectedEdgeId, onNodeSelect],
  )

  // Handle edge click
  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setSelectedEdgeId(edge.id)
      setSelectedNodeId(null)
      onEdgeSelect?.(edge.id)
    },
    [setSelectedEdgeId, setSelectedNodeId, onEdgeSelect],
  )

  // Handle pane click (deselect)
  const handlePaneClick = useCallback(() => {
    clearSelection()
    closeContextMenu()
    onNodeSelect?.(null)
    onEdgeSelect?.(null)
  }, [clearSelection, closeContextMenu, onNodeSelect, onEdgeSelect])

  // Handle new connection
  const handleConnect: OnConnect = useCallback(
    (params) => {
      if (!params.source || !params.target) {
        return
      }

      const sourceNode = nodes.find((node) => node.id === params.source)
      const targetNode = nodes.find((node) => node.id === params.target)
      if (!sourceNode || !targetNode || sourceNode.type !== 'service') {
        return
      }

      if (targetNode.type !== 'service' && targetNode.type !== 'database') {
        return
      }

      const hasConnection = edges.some(
        (edge) => edge.source === params.source && edge.target === params.target,
      )
      if (hasConnection) {
        return
      }

      addCanvasEdge({
        id: `service-connection-local-${params.source}-${params.target}-${Date.now()}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle ?? undefined,
        targetHandle: params.targetHandle ?? undefined,
        type: 'connection',
        data: {
          connectionType: 'depends',
        },
      })

      if (onCreateConnection) {
        onCreateConnection({
          fromServiceId: params.source,
          toServiceId: targetNode.type === 'service' ? params.target : undefined,
          toDatabaseId: targetNode.type === 'database' ? params.target : undefined,
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

  // Handle node context menu (right-click)
  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault()
      openContextMenu({ x: event.clientX, y: event.clientY }, node.id, node.type)
    },
    [openContextMenu],
  )

  // Handle pane context menu (right-click on background)
  const handlePaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      event.preventDefault()
      openContextMenu({ x: event.clientX, y: event.clientY })
    },
    [openContextMenu],
  )

  // Connection validation: only services can be sources, no self-connections
  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      if (connection.source === connection.target) return false
      const sourceNode = nodes.find((n) => n.id === connection.source)
      const targetNode = nodes.find((n) => n.id === connection.target)
      if (sourceNode?.type !== 'service') {
        return false
      }
      return targetNode?.type === 'service' || targetNode?.type === 'database'
    },
    [nodes],
  )

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
        className="!bg-black"
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
              <p className="mt-1.5 text-xs text-neutral-700">
                Build your architecture visually
              </p>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}
