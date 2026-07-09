import { IconX } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import type { Node } from '@xyflow/react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useState } from 'react'
import { CanvasEditor, CanvasProvider, CanvasSidebar } from '@/components/canvas'
import { CanvasContextMenu } from '@/components/canvas/canvas-context-menu'
import { CanvasToolbar } from '@/components/canvas/canvas-toolbar'
import { DeployDialog } from '@/components/canvas/deploy-dialog'
import { LogsPanel } from '@/components/canvas/logs-panel'
import { NodePropertyEditor, type PropertyAction } from '@/components/canvas/node-property-editor'
import { YamlPreviewPanel } from '@/components/canvas/yaml-preview'
import { useProjectCanvas } from '@/hooks/use-project-canvas'
import { useWorkspace } from '@/providers/workspace-provider'
import {
  deleteDatabase,
  deleteService,
  deployDatabase,
  deployService,
  projectKeys,
  projectQueries,
  restartService,
  startDatabase,
  startService,
  stopDatabase,
  stopService,
  updateDatabase,
  updateService,
} from '@/shared/api'

export const Route = createFileRoute('/_auth/projects/$slug')({
  component: ProjectDetailPage,
})

function ProjectDetailPage() {
  const { slug } = Route.useParams()
  const { currentWorkspace } = useWorkspace()
  const { data: project, isLoading } = useQuery({
    ...projectQueries.bySlug(currentWorkspace?.id ?? '', slug),
    enabled: Boolean(currentWorkspace),
  })

  if (!currentWorkspace) {
    return (
      <div className="flex h-screen items-center justify-center bg-black font-mono">
        <div className="text-center">
          <div className="text-xs text-neutral-600">$ error --code=WORKSPACE_REQUIRED</div>
          <h1 className="mt-2 text-sm text-neutral-400">workspace required</h1>
          <Link to="/projects">
            <button
              type="button"
              className="mt-4 rounded border border-neutral-800 bg-neutral-950 px-4 py-1.5 text-xs text-neutral-400 transition hover:border-neutral-700 hover:text-white"
            >
              $ cd /projects
            </button>
          </Link>
        </div>
      </div>
    )
  }

  if (!project && !isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black font-mono">
        <div className="text-center">
          <div className="text-xs text-neutral-600">$ error --code=NOT_FOUND</div>
          <h1 className="mt-2 text-sm text-neutral-400">project not found</h1>
          <Link to="/projects">
            <button
              type="button"
              className="mt-4 rounded border border-neutral-800 bg-neutral-950 px-4 py-1.5 text-xs text-neutral-400 transition hover:border-neutral-700 hover:text-white"
            >
              $ cd /projects
            </button>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading || !project) {
    return (
      <div className="flex h-screen items-center justify-center bg-black font-mono">
        <div className="text-center">
          <div className="text-xs text-neutral-600">$ loading...</div>
        </div>
      </div>
    )
  }

  return <ProjectCanvasView projectId={project.id} projectName={project.name} />
}

interface ProjectCanvasViewProps {
  projectId: string
  projectName: string
}

function ProjectCanvasView({ projectId, projectName }: ProjectCanvasViewProps) {
  const queryClient = useQueryClient()

  const {
    project,
    nodes,
    edges,
    serviceGroups,
    handlePositionChange,
    handleCreateService,
    handleCreateDatabase,
    handleCreateConnection,
    handleDeleteConnection,
    handleCreateServiceGroup,
    handleAssignNodeToServiceGroup,
    handleDeleteServiceGroup,
    handleMoveServiceGroup,
    handleResizeServiceGroup,
    findService,
    findDatabase,
    getNodeServiceGroupId,
    getNodeType,
  } = useProjectCanvas(projectId)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [yamlOpen, setYamlOpen] = useState(false)
  const [deployOpen, setDeployOpen] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [logsTarget, setLogsTarget] = useState<{
    nodeId: string
    nodeType: 'service' | 'database'
  } | null>(null)

  const invalidateProject = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: projectKeys.withServices(projectId) })
    queryClient.invalidateQueries({ queryKey: projectKeys.generatedFiles(projectId) })
  }, [queryClient, projectId])

  // Service mutations
  const updateServiceMutation = useMutation({
    mutationFn: updateService,
    onSuccess: invalidateProject,
  })
  const deleteServiceMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: invalidateProject,
  })
  const deployServiceMutation = useMutation({
    mutationFn: deployService,
    onSuccess: invalidateProject,
  })
  const startServiceMutation = useMutation({
    mutationFn: startService,
    onSuccess: invalidateProject,
  })
  const stopServiceMutation = useMutation({
    mutationFn: stopService,
    onSuccess: invalidateProject,
  })
  const restartServiceMutation = useMutation({
    mutationFn: restartService,
    onSuccess: invalidateProject,
  })

  // Database mutations
  const updateDatabaseMutation = useMutation({
    mutationFn: updateDatabase,
    onSuccess: invalidateProject,
  })
  const deleteDatabaseMutation = useMutation({
    mutationFn: deleteDatabase,
    onSuccess: invalidateProject,
  })
  const deployDatabaseMutation = useMutation({
    mutationFn: deployDatabase,
    onSuccess: invalidateProject,
  })
  const startDatabaseMutation = useMutation({
    mutationFn: startDatabase,
    onSuccess: invalidateProject,
  })
  const stopDatabaseMutation = useMutation({
    mutationFn: stopDatabase,
    onSuccess: invalidateProject,
  })

  const isActionPending =
    updateServiceMutation.isPending ||
    deleteServiceMutation.isPending ||
    deployServiceMutation.isPending ||
    startServiceMutation.isPending ||
    stopServiceMutation.isPending ||
    restartServiceMutation.isPending ||
    updateDatabaseMutation.isPending ||
    deleteDatabaseMutation.isPending ||
    deployDatabaseMutation.isPending ||
    startDatabaseMutation.isPending ||
    stopDatabaseMutation.isPending

  const handleNodeAction = useCallback(
    (nodeId: string, nodeType: 'service' | 'database' | null, action: PropertyAction) => {
      if (nodeType === 'service') {
        switch (action.type) {
          case 'updateName':
            updateServiceMutation.mutate({ serviceId: nodeId, name: action.name })
            break
          case 'updateSourceConfig':
            updateServiceMutation.mutate({ serviceId: nodeId, sourceConfig: action.sourceConfig })
            break
          case 'delete':
            deleteServiceMutation.mutate(nodeId)
            setSelectedNodeId(null)
            break
          case 'deploy':
            deployServiceMutation.mutate(nodeId)
            break
          case 'start':
            startServiceMutation.mutate(nodeId)
            break
          case 'stop':
            stopServiceMutation.mutate(nodeId)
            break
          case 'restart':
            restartServiceMutation.mutate(nodeId)
            break
        }
      } else if (nodeType === 'database') {
        switch (action.type) {
          case 'updateName':
            updateDatabaseMutation.mutate({ databaseId: nodeId, name: action.name })
            break
          case 'updateCredentials':
            updateDatabaseMutation.mutate({
              databaseId: nodeId,
              credentials: JSON.stringify(action.credentials),
            })
            break
          case 'delete':
            deleteDatabaseMutation.mutate(nodeId)
            setSelectedNodeId(null)
            break
          case 'deploy':
            deployDatabaseMutation.mutate(nodeId)
            break
          case 'start':
            startDatabaseMutation.mutate(nodeId)
            break
          case 'stop':
            stopDatabaseMutation.mutate(nodeId)
            break
        }
      }
    },
    [
      updateServiceMutation,
      deleteServiceMutation,
      deployServiceMutation,
      startServiceMutation,
      stopServiceMutation,
      restartServiceMutation,
      updateDatabaseMutation,
      deleteDatabaseMutation,
      deployDatabaseMutation,
      startDatabaseMutation,
      stopDatabaseMutation,
    ],
  )

  const selectedNodeType = selectedNodeId ? getNodeType(selectedNodeId) : null
  const actionableSelectedNodeType = selectedNodeType === 'service-group' ? null : selectedNodeType

  const selectedService =
    selectedNodeId && selectedNodeType === 'service' ? (findService(selectedNodeId) ?? null) : null

  const selectedDatabase =
    selectedNodeId && selectedNodeType === 'database'
      ? (findDatabase(selectedNodeId) ?? null)
      : null

  const handleNodeSelect = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId)
  }, [])

  const handleNodeDragStop = useCallback(
    (node: Node) => {
      const nodeType = getNodeType(node.id)
      const maybeAbsolute = (node as Node & { positionAbsolute?: { x: number; y: number } })
        .positionAbsolute
      const groupId = getNodeServiceGroupId(node.id)
      const parentGroup = groupId ? serviceGroups.find((group) => group.id === groupId) : null
      const absolutePosition =
        maybeAbsolute ??
        (parentGroup
          ? {
              x: node.position.x + parentGroup.canvasPosition.x,
              y: node.position.y + parentGroup.canvasPosition.y,
            }
          : node.position)

      if (nodeType === 'service' || nodeType === 'database') {
        handlePositionChange(node.id, absolutePosition)
      }
      if (nodeType === 'service-group') {
        handleMoveServiceGroup(node.id, absolutePosition)
      }
    },
    [
      getNodeType,
      getNodeServiceGroupId,
      handlePositionChange,
      handleMoveServiceGroup,
      serviceGroups,
    ],
  )

  const handleNodesUpdate = useCallback(
    (updatedNodes: Node[]) => {
      for (const node of updatedNodes) {
        if (node.type !== 'service-group') {
          continue
        }
        const group = serviceGroups.find((entry) => entry.id === node.id)
        if (!group) {
          continue
        }

        const style = node.style as Record<string, unknown> | undefined
        const width =
          typeof node.width === 'number'
            ? node.width
            : typeof style?.width === 'number'
              ? style.width
              : null
        const height =
          typeof node.height === 'number'
            ? node.height
            : typeof style?.height === 'number'
              ? style.height
              : null

        if (width == null || height == null) {
          continue
        }

        if (Math.round(width) !== group.size.width || Math.round(height) !== group.size.height) {
          handleResizeServiceGroup(node.id, { width, height })
        }
      }
    },
    [serviceGroups, handleResizeServiceGroup],
  )

  const { data: generatedFiles } = useQuery(projectQueries.generatedFiles(projectId))

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
                <YamlPreviewPanel
                  dockerComposeYaml={generatedFiles?.['docker-compose.yml'] ?? ''}
                  mizuYaml={generatedFiles?.['mizu.yml'] ?? ''}
                />
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
