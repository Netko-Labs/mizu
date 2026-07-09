import { IconChevronRight, IconFolder, IconPlus } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { CreateProjectDialog } from '@/components/projects/create-project-dialog'
import { TerminalCard } from '@/components/shared/terminal'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { HomeRecentProjectsProps } from '../lib/types'
import { ProjectItem } from './project-item'

export function HomeRecentProjects({ projects, isLoading, hasWorkspace }: HomeRecentProjectsProps) {
  return (
    <TerminalCard title="~/projects --recent" delay={0.3}>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-xs text-neutral-600">$ ls -la | head -4</div>
        <Link
          to="/projects"
          className="flex items-center gap-1 text-[10px] text-neutral-600 transition-colors hover:text-neutral-400"
        >
          view all
          <IconChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={String(i)}
              className="h-16 rounded-lg border border-neutral-800 bg-neutral-950"
            />
          ))}
        </div>
      ) : !hasWorkspace ? (
        <div className="py-8 text-center">
          <div className="mb-2 text-xs text-yellow-500">! no workspace selected</div>
          <div className="text-[10px] text-neutral-600">$ workspace --select</div>
        </div>
      ) : projects.length === 0 ? (
        <div className="py-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-800 bg-black">
            <IconFolder className="h-6 w-6 text-neutral-700" />
          </div>
          <div className="mb-1 text-xs text-neutral-400">no projects found</div>
          <div className="mb-4 text-[10px] text-neutral-600">$ mizu init</div>
          <CreateProjectDialog>
            <Button
              size="sm"
              className="rounded-lg border border-neutral-800 bg-neutral-900 font-mono text-xs text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
              <IconPlus className="mr-1.5 h-3 w-3" />
              new project
            </Button>
          </CreateProjectDialog>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((project, index) => (
            <ProjectItem
              key={project.id}
              name={project.name}
              slug={project.slug}
              description={project.description}
              delay={0.1 * index}
            />
          ))}
        </div>
      )}
    </TerminalCard>
  )
}
