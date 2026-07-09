import { IconFolder, IconPlus } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useState } from 'react'
import { TerminalCard } from '@/components/midnight-aurora'
import { CreateProjectDialog } from '@/components/projects/create-project-dialog'
import { ProjectCard } from '@/components/projects/project-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useWorkspace } from '@/providers/workspace-provider'
import { projectQueries } from '@/shared/api'

export const Route = createFileRoute('/_auth/projects/')({
  component: ProjectsDashboard,
})

function ProjectsDashboard() {
  const { currentWorkspace, isLoading: isWorkspaceLoading } = useWorkspace()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: projects = [], isLoading } = useQuery({
    ...projectQueries.list(currentWorkspace?.id ?? ''),
    enabled: Boolean(currentWorkspace),
  })

  const filteredProjects = searchQuery.trim()
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : projects

  if (isWorkspaceLoading) {
    return (
      <div className="relative min-h-screen bg-black font-mono">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-950 via-black to-black" />
        <div className="relative mx-auto max-w-6xl px-6 py-8">
          <div className="space-y-6">
            <div className="h-6 w-48 animate-pulse rounded bg-neutral-800" />
            <div className="h-10 animate-pulse rounded-lg bg-neutral-900" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={String(i)}
                  className="h-28 animate-pulse rounded-lg border border-neutral-800 bg-neutral-950"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentWorkspace) {
    return (
      <div className="relative min-h-screen bg-black font-mono">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-950 via-black to-black" />
        <div className="relative mx-auto max-w-6xl px-6 py-8">
          <motion.header
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="text-xs text-neutral-600">$ mizu ls --projects</div>
            <h1 className="mt-2 text-xl text-neutral-400">
              <span className="text-white">projects</span>
            </h1>
          </motion.header>

          <TerminalCard title="workspace.required" delay={0.1}>
            <div className="py-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-800 bg-black">
                <IconFolder className="h-6 w-6 text-neutral-700" />
              </div>
              <div className="mb-1 text-xs text-neutral-400">no workspace selected</div>
              <div className="text-[10px] text-neutral-600">
                $ use the sidebar to create or select a workspace
              </div>
            </div>
          </TerminalCard>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-black font-mono">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-950 via-black to-black" />

      <div className="relative mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="text-xs text-neutral-600">$ mizu ls --projects</div>
          <h1 className="mt-2 text-xl text-neutral-400">
            <span className="text-white">projects</span>
          </h1>
        </motion.header>

        {/* System banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-xs"
        >
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-neutral-600">
            <span>
              <span className="text-neutral-700">workspace:</span>
              <span className="ml-1 text-neutral-400">{currentWorkspace.name}</span>
            </span>
            <span>
              <span className="text-neutral-700">projects:</span>
              <span className="ml-1 text-blue-500">{projects.length}</span>
            </span>
          </div>
        </motion.div>

        {/* Search + Create */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 flex flex-wrap items-center gap-3"
        >
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2">
            <span className="text-[10px] text-neutral-700">$ grep -i</span>
            <Input
              placeholder="search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-6 border-0 bg-transparent px-0 text-xs text-neutral-300 placeholder:text-neutral-700 focus-visible:ring-0"
              disabled={isLoading}
            />
          </div>
          <CreateProjectDialog>
            <Button
              size="sm"
              className="rounded-lg border border-neutral-800 bg-neutral-900 font-mono text-xs text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
              <IconPlus className="mr-1.5 h-3 w-3" />$ mizu new
            </Button>
          </CreateProjectDialog>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={String(i)}
                className="h-28 animate-pulse rounded-lg border border-neutral-800 bg-neutral-950"
              />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <TerminalCard title="projects.list" delay={0.2}>
            <div className="py-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-800 bg-black">
                <IconFolder className="h-6 w-6 text-neutral-700" />
              </div>
              <div className="mb-1 text-xs text-neutral-400">
                {searchQuery.trim() ? 'no matching projects' : 'no projects yet'}
              </div>
              <div className="mb-4 text-[10px] text-neutral-600">$ mizu init --name my-project</div>
              {!searchQuery.trim() && (
                <CreateProjectDialog>
                  <Button
                    size="sm"
                    className="rounded-lg border border-neutral-800 bg-neutral-900 font-mono text-xs text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  >
                    <IconPlus className="mr-1.5 h-3 w-3" />
                    create first project
                  </Button>
                </CreateProjectDialog>
              )}
            </div>
          </TerminalCard>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} delay={0.05 * index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
