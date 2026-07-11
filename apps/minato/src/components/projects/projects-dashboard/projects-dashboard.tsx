import { IconFolder } from '@tabler/icons-react'
import { ProjectCard } from '@/components/projects/project-card'
import { TerminalCard } from '@/components/shared/terminal'
import { DashboardEmpty } from './dashboard-empty'
import { DashboardHeader } from './dashboard-header'
import { DashboardSkeleton, ProjectGridSkeleton } from './dashboard-skeleton'
import { DashboardStatline } from './dashboard-statline'
import { useProjectsDashboard } from './lib'

export function ProjectsDashboard() {
  const {
    currentWorkspace,
    isWorkspaceLoading,
    isLoading,
    projects,
    filteredProjects,
    isFiltered,
    searchQuery,
    setSearchQuery,
  } = useProjectsDashboard()

  return (
    <div className="relative min-h-screen bg-black font-mono">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-950 via-black to-black" />

      <div className="relative mx-auto max-w-6xl px-6 py-8">
        {isWorkspaceLoading ? (
          <DashboardSkeleton />
        ) : !currentWorkspace ? (
          <>
            <DashboardHeader
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              showToolbar={false}
            />
            <TerminalCard title="workspace.required" delay={0.1}>
              <div className="py-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-800 bg-black">
                  <IconFolder className="h-6 w-6 text-neutral-700" />
                </div>
                <div className="mb-1 text-xs text-neutral-400">no workspace selected</div>
                <div className="text-[10px] text-neutral-600">
                  $ use the sidebar to create or select a workspace
                </div>
              </div>
            </TerminalCard>
          </>
        ) : (
          <>
            <DashboardHeader
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchDisabled={isLoading}
            />
            <DashboardStatline
              workspaceName={currentWorkspace.name}
              projectCount={projects.length}
            />
            {isLoading ? (
              <ProjectGridSkeleton />
            ) : filteredProjects.length === 0 ? (
              <DashboardEmpty isFiltered={isFiltered} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    delay={Math.min(0.04 * index, 0.2)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
