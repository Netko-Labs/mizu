import { IconX } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'motion/react'
import { CanvasContextMenu } from '@/components/canvas/canvas-context-menu'
import { CanvasEditor } from '@/components/canvas/canvas-editor'
import { CanvasProvider } from '@/components/canvas/canvas-provider'
import { CanvasSidebar } from '@/components/canvas/canvas-sidebar'
import { CanvasToolbar } from '@/components/canvas/canvas-toolbar'
import { DeployDialog } from '@/components/canvas/deploy-dialog'
import { LogsPanel } from '@/components/canvas/logs-panel'
import { ProjectSettingsDialog } from '@/components/canvas/project-settings-dialog'
import { ServiceDrawer } from '@/components/canvas/service-drawer'
import { YamlPreviewPanel } from '@/components/canvas/yaml-preview'
import type { CanvasViewInnerProps, CanvasViewProps } from './lib'
import { useActiveEnvironment, useCanvasView } from './lib'

/**
 * Resolves the active deployment environment before mounting the canvas, so the
 * Suspense graph query always has a concrete environment to scope to.
 */
export function CanvasView({ projectId, projectName }: CanvasViewProps) {
  const { environments, activeEnvironmentId, setActiveEnvironmentId, isLoading } =
    useActiveEnvironment(projectId)

  if (isLoading || !activeEnvironmentId) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black font-mono">
        <div className="text-xs text-neutral-600">$ loading environments...</div>
      </div>
    )
  }

  return (
    <CanvasViewInner
      projectId={projectId}
      projectName={projectName}
      environments={environments}
      activeEnvironmentId={activeEnvironmentId}
      onEnvironmentChange={setActiveEnvironmentId}
    />
  )
}

function CanvasViewInner({
  projectId,
  projectName,
  environments,
  activeEnvironmentId,
  onEnvironmentChange,
}: CanvasViewInnerProps) {
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
  } = useCanvasView(projectId, activeEnvironmentId)

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
    settingsOpen,
    setSettingsOpen,
    selectedNodeId,
    setSelectedNodeId,
    drawerTab,
    setDrawerTab,
    logsTarget,
    setLogsTarget,
  } = overlays

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* Canvas + toolbar (toolbar must be inside CanvasProvider for grid toggle / fit view) */}
      <CanvasProvider initialNodes={nodes} initialEdges={edges} onNodesUpdate={handleNodesUpdate}>
        <CanvasToolbar
          projectName={projectName}
          projectId={projectId}
          environments={environments}
          activeEnvironmentId={activeEnvironmentId}
          onEnvironmentChange={onEnvironmentChange}
          nodeCount={(project?.services.length ?? 0) + (project?.databases.length ?? 0)}
          sidebarOpen={sidebarOpen}
          yamlOpen={yamlOpen}
          logsOpen={!!logsTarget}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleYaml={() => setYamlOpen(!yamlOpen)}
          onToggleLogs={() =>
            setLogsTarget((prev) => (prev ? null : { nodeId: '', nodeType: 'service' }))
          }
          onOpenSettings={() => setSettingsOpen(true)}
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
            onViewLogs={(nodeId) => {
              // Node-level log actions open the drawer on its Logs tab; the
              // toolbar toggle keeps the project-level bottom tail.
              setSelectedNodeId(nodeId)
              setDrawerTab('logs')
            }}
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

      {/* Service drawer — wide, non-modal tabbed panel floating over the canvas */}
      <AnimatePresence>
        {selectedNodeId && (selectedService || selectedDatabase) && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute top-14 right-3 bottom-3 z-30 w-[620px] max-w-[calc(100vw-360px)] overflow-hidden rounded-xl border border-border bg-card/95 shadow-2xl backdrop-blur-md"
          >
            <ServiceDrawer
              nodeId={selectedNodeId}
              nodeType={actionableSelectedNodeType}
              service={selectedService}
              database={selectedDatabase}
              projectSlug={project?.slug ?? ''}
              initialTab={drawerTab}
              onClose={() => {
                setSelectedNodeId(null)
                setDrawerTab(null)
              }}
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
      {settingsOpen && project && (
        <ProjectSettingsDialog open onClose={() => setSettingsOpen(false)} project={project} />
      )}
    </div>
  )
}
