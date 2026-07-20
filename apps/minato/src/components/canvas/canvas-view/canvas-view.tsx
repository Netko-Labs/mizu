import { AnimatePresence, motion } from 'motion/react'
import { AddComponentMenu } from '@/components/canvas/add-component-menu'
import { CanvasContextMenu } from '@/components/canvas/canvas-context-menu'
import { CanvasEditor } from '@/components/canvas/canvas-editor'
import { CanvasProvider } from '@/components/canvas/canvas-provider'
import { CanvasToolbar } from '@/components/canvas/canvas-toolbar'
import { DeployDialog } from '@/components/canvas/deploy-dialog'
import { ProjectDrawer } from '@/components/canvas/project-drawer'
import { ServiceDrawer } from '@/components/canvas/service-drawer'
import { Spinner } from '@/components/ui/spinner'
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
        <Spinner className="size-4 text-muted-foreground" />
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
    addOpen,
    setAddOpen,
    deployOpen,
    setDeployOpen,
    selectedNodeId,
    setSelectedNodeId,
    drawerTab,
    setDrawerTab,
    projectTab,
    setProjectTab,
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
          onOpenAdd={() => setAddOpen(true)}
          onOpenProject={() => {
            // Right-edge panels are mutually exclusive with the service drawer.
            setSelectedNodeId(null)
            setProjectTab('settings')
          }}
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
            onEditProperties={(nodeId) => {
              setProjectTab(null)
              setSelectedNodeId(nodeId)
            }}
            onNodeAction={handleNodeAction}
            onViewLogs={(nodeId) => {
              // Log actions open the drawer on its Logs tab.
              setProjectTab(null)
              setSelectedNodeId(nodeId)
              setDrawerTab('logs')
            }}
            onAddService={handleCreateService}
            onAddDatabase={handleCreateDatabase}
          />
        </div>
      </CanvasProvider>
      {/* Service drawer — wide, non-modal tabbed panel floating over the canvas */}
      <AnimatePresence>
        {selectedNodeId && (selectedService || selectedDatabase) && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute top-14 right-3 bottom-3 z-30 w-[680px] max-w-[calc(100vw-360px)] overflow-hidden rounded-xl border border-border bg-card/95 shadow-2xl backdrop-blur-md"
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
      {/* Project config panel — settings / mizu.yml / activity */}
      <AnimatePresence>
        {projectTab && project && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute top-14 right-3 bottom-3 z-30 w-[480px] max-w-[calc(100vw-360px)] overflow-hidden rounded-xl border border-border bg-card/95 shadow-2xl backdrop-blur-md"
          >
            <ProjectDrawer
              project={project}
              tab={projectTab}
              onTabChange={setProjectTab}
              mizuYaml={generatedFiles?.['mizu.yml'] ?? ''}
              onClose={() => setProjectTab(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Add-component command menu */}
      <AddComponentMenu
        open={addOpen}
        onOpenChange={setAddOpen}
        onAddService={handleCreateService}
        onAddDatabase={handleCreateDatabase}
      />
      \1
      <DeployDialog projectId={projectId} open={deployOpen} onOpenChange={setDeployOpen} />
    </div>
  )
}
