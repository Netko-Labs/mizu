import {
  IconArrowLeft,
  IconBolt,
  IconCode,
  IconFocusCentered,
  IconGrid3x3,
  IconHistory,
  IconLayoutSidebar,
  IconSettings,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useReactFlow } from '@xyflow/react'
import { useCanvas } from '@/components/canvas/canvas-provider'
import { EnvironmentSwitcher } from '@/components/canvas/environment-switcher'
import type { SwitcherEnvironment } from '@/components/canvas/environment-switcher/lib'
import { cn } from '@/lib/utils'

interface CanvasToolbarProps {
  projectName: string
  projectId: string
  environments: SwitcherEnvironment[]
  activeEnvironmentId: string
  onEnvironmentChange: (id: string) => void
  nodeCount: number
  sidebarOpen: boolean
  yamlOpen: boolean
  activityOpen: boolean
  onToggleSidebar: () => void
  onToggleYaml: () => void
  onToggleActivity: () => void
  onOpenSettings: () => void
  onDeploy: () => void
}

function ToolbarButton({
  active,
  onClick,
  title,
  children,
  label,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-all duration-150',
        active
          ? 'bg-blue-500/15 text-blue-400'
          : 'text-neutral-500 hover:bg-blue-500/10 hover:text-blue-300',
      )}
      title={title}
    >
      {children}
      {label && <span className="font-medium">{label}</span>}
    </button>
  )
}

export function CanvasToolbar({
  projectName,
  projectId,
  environments,
  activeEnvironmentId,
  onEnvironmentChange,
  nodeCount,
  sidebarOpen,
  yamlOpen,
  activityOpen,
  onToggleSidebar,
  onToggleYaml,
  onToggleActivity,
  onOpenSettings,
  onDeploy,
}: CanvasToolbarProps) {
  const { showGrid, toggleGrid } = useCanvas()

  return (
    <div className="absolute inset-x-0 top-0 z-10 flex h-12 items-center justify-between border-b border-blue-500/10 bg-black/95 px-4 backdrop-blur-md">
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          to="/projects"
          className="flex items-center gap-1.5 text-xs text-neutral-500 transition-colors hover:text-blue-400"
        >
          <IconArrowLeft className="size-3.5" />
          <span>Projects</span>
        </Link>
        <span className="text-neutral-700">/</span>
        <span className="text-sm font-medium text-white">{projectName}</span>
        <span className="text-neutral-700">/</span>
        <EnvironmentSwitcher
          projectId={projectId}
          environments={environments}
          activeEnvironmentId={activeEnvironmentId}
          onSelect={onEnvironmentChange}
        />
        <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] text-blue-400/70">
          {nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}
        </span>
      </div>

      {/* Center: canvas tools */}
      <div className="flex items-center gap-0.5 rounded-xl border border-blue-500/10 bg-blue-500/[0.03] px-1 py-0.5">
        <ToolbarButton
          active={sidebarOpen}
          onClick={onToggleSidebar}
          title="Toggle sidebar"
          label="Sidebar"
        >
          <IconLayoutSidebar className="size-3.5" />
        </ToolbarButton>

        <div className="mx-0.5 h-4 w-px bg-blue-500/10" />

        <ToolbarButton active={showGrid} onClick={toggleGrid} title="Toggle grid" label="Grid">
          <IconGrid3x3 className="size-3.5" />
        </ToolbarButton>

        <FitViewButton />

        <div className="mx-0.5 h-4 w-px bg-blue-500/10" />

        <ToolbarButton
          active={yamlOpen}
          onClick={onToggleYaml}
          title="Toggle YAML preview"
          label="YAML"
        >
          <IconCode className="size-3.5" />
        </ToolbarButton>

        <ToolbarButton
          active={activityOpen}
          onClick={onToggleActivity}
          title="Toggle activity feed"
          label="Activity"
        >
          <IconHistory className="size-3.5" />
        </ToolbarButton>
      </div>

      {/* Right: project settings + deploy */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenSettings}
          title="Project settings"
          className="flex items-center rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-blue-500/10 hover:text-neutral-300"
        >
          <IconSettings className="size-4" />
        </button>
        <button
          type="button"
          onClick={onDeploy}
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-blue-600 active:scale-[0.98]"
        >
          <IconBolt className="size-3.5" />
          Deploy
        </button>
      </div>
    </div>
  )
}

/** Separated because useReactFlow must be inside ReactFlowProvider */
function FitViewButton() {
  let reactFlow: ReturnType<typeof useReactFlow> | null = null
  try {
    // biome-ignore lint/correctness/useHookAtTopLevel: unconditional call — try/catch only guards rendering outside ReactFlowProvider
    reactFlow = useReactFlow()
  } catch {
    // Not inside ReactFlowProvider yet
  }

  return (
    <ToolbarButton
      onClick={() => reactFlow?.fitView({ padding: 0.3, maxZoom: 1.2 })}
      title="Fit view"
      label="Fit"
    >
      <IconFocusCentered className="size-3.5" />
    </ToolbarButton>
  )
}
