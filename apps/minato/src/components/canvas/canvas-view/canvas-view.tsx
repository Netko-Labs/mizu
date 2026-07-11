import { IconX } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'motion/react'
import { CanvasContextMenu } from '@/components/canvas/canvas-context-menu'
import { CanvasEditor } from '@/components/canvas/canvas-editor'
import { CanvasProvider } from '@/components/canvas/canvas-provider'
import { CanvasSidebar } from '@/components/canvas/canvas-sidebar'
import { CanvasToolbar } from '@/components/canvas/canvas-toolbar'
import { DeployDialog } from '@/components/canvas/deploy-dialog'
import { LogsPanel } from '@/components/canvas/logs-panel'
import { NodePropertyEditor } from '@/components/canvas/node-property-editor'
import { YamlPreviewPanel } from '@/components/canvas/yaml-preview'
import type { CanvasViewProps } from './lib'
import { useCanvasView } from './lib'

export function CanvasView({ projectId, projectName }: CanvasViewProps) {
  const {
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
  } = useCanvasView(projectId)

  const {
    project,
    nodes,
    edges,
    serviceGroups,
    handleCreateService,
    handleCreateDatabase,
    handleCreateConnection,
    handleDeleteConnection,
    handleCreateServiceGroup,
    handleAssignNodeToServiceGroup,
    handleDeleteServiceGroup,
    findService,
    findDatabase,
    getNodeServiceGroupId,
  } = canvas

  const {
    sidebarOpen,
    setSidebarOpen,
    yamlOpen,
    setYamlOpen,
    deployOpen,
    setDeployOpen,
    selectedNodeId,
    setSelectedNodeId,
    logsTarget,
    setLogsTarget,
  } = overlays

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* Canvas + toolbar (toolbar must be inside CanvasProvider for grid toggle / fit view) */}
      <CanvasProvider initialNodes={nodes} initialEdges={edges} onNodesUpdate={handleNodesUpdate}>
        <CanvasToolbar
          projectName={projectName}
          nodeCount={(project?.services.length ?? 0) + (project?.databases.length ?? 0)}
          sidebarOpen={sidebarOpen}
          yamlOpen={yamlOpen}
          logsOpen={!!logsTarget}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleYaml={() => setYamlOpen(!yamlOpen)}
          onToggleLogs={() =>
            setLogsTarget((prev) => (prev ? null : { nodeId: '', nodeType: 'service' }))
          }
          onDeploy={() => setDeployOpen(true)}
        />

        {/* Fullscreen canvas */}
        <div className="absolute inset-0 pt-12">
          <CanvasEditor
            onNodeSelect={handleNodeSelect}
            onAddService={handleCreateService}
            onAddDatabase={handleCreateDatabase}
            onCreateConnection={handleCreateConnection}
            onDeleteConnection={handleDeleteConnection}
            onNodeDragStop={handleNodeDragStop}
          />
          <CanvasContextMenu
            findService={findService}
            findDatabase={findDatabase}
            serviceGroups={serviceGroups}
            getNodeServiceGroupId={getNodeServiceGroupId}
            onCreateServiceGroup={handleCreateServiceGroup}
            onAssignNodeToServiceGroup={handleAssignNodeToServiceGroup}
            onDeleteServiceGroup={handleDeleteServiceGroup}
            onEditProperties={(nodeId) => setSelectedNodeId(nodeId)}
            onNodeAction={handleNodeAction}
            onViewLogs={(nodeId, nodeType) => setLogsTarget({ nodeId, nodeType })}
            onAddService={handleCreateService}
            onAddDatabase={handleCreateDatabase}
          />
        </div>
      </CanvasProvider>

      {/* Left sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-0 left-0 top-12 z-30 w-[280px] border-r border-blue-500/10 bg-black/95 backdrop-blur-md"
          >
            <div className="flex h-full flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-blue-500/10 px-3 py-2">
                <span className="text-[10px] text-neutral-600"># components</span>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="rounded p-1 text-neutral-600 hover:text-neutral-400"
                >
                  <IconX className="size-3" />
                </button>
              </div>
              <CanvasSidebar
                onAddService={handleCreateService}
                onAddDatabase={handleCreateDatabase}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right property panel overlay */}
      <AnimatePresence>
        {selectedNodeId && (selectedService || selectedDatabase) && (
          <motion.div
            initial={{ x: 340, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 340, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-0 right-0 top-12 z-20 w-[340px] border-l border-blue-500/10 bg-black/95 backdrop-blur-md"
          >
            <NodePropertyEditor
              nodeId={selectedNodeId}
              projectSlug={project?.slug ?? ''}
              service={selectedService}
              database={selectedDatabase}
              nodeType={actionableSelectedNodeType}
              onClose={() => setSelectedNodeId(null)}
              onAction={(action) =>
                handleNodeAction(selectedNodeId, actionableSelectedNodeType, action)
              }
              isActionPending={isActionPending}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* YAML preview overlay */}
      <AnimatePresence>
        {yamlOpen && (
          <motion.div
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-0 right-0 top-12 z-20 w-[380px] border-l border-blue-500/10 bg-black/95 backdrop-blur-md"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-blue-500/10 px-3 py-2">
                <span className="text-[10px] text-neutral-600"># yaml preview</span>
                <button
                  type="button"
                  onClick={() => setYamlOpen(false)}
                  className="rounded p-1 text-neutral-600 hover:text-neutral-400"
                >
                  <IconX className="size-3" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-3">
                <YamlPreviewPanel mizuYaml={generatedFiles?.['mizu.yml'] ?? ''} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logs panel */}
      <AnimatePresence>
        {logsTarget && (
          <motion.div
            initial={{ y: 250, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 250, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-x-0 bottom-0 z-20 h-[250px]"
          >
            <LogsPanel
              serviceId={logsTarget.nodeType === 'service' ? logsTarget.nodeId : undefined}
              databaseId={logsTarget.nodeType === 'database' ? logsTarget.nodeId : undefined}
              entityName={
                logsTarget.nodeType === 'service'
                  ? findService(logsTarget.nodeId)?.name
                  : findDatabase(logsTarget.nodeId)?.name
              }
              onClose={() => setLogsTarget(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deploy dialog */}
      <DeployDialog projectId={projectId} open={deployOpen} onOpenChange={setDeployOpen} />
    </div>
  )
}
