import { IconFolder, IconPlus } from '@tabler/icons-react'
import { CreateProjectDialog } from '@/components/projects/create-project-dialog'
import { TerminalCard } from '@/components/shared/terminal'
import { Button } from '@/components/ui/button'
import type { DashboardEmptyProps } from '../lib/types'

export function DashboardEmpty({ isFiltered }: DashboardEmptyProps) {
  return (
    <TerminalCard title="projects.list" delay={0.15}>
      <div className="py-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-800 bg-black">
          <IconFolder className="h-6 w-6 text-neutral-700" />
        </div>
        <div className="mb-1 text-xs text-neutral-400">
          {isFiltered ? 'no matching projects' : 'no projects yet'}
        </div>
        <div className="mb-4 text-[10px] text-neutral-600">$ mizu init --name my-project</div>
        {!isFiltered && (
          <CreateProjectDialog>
            <Button
              size="sm"
              className="h-7 rounded-md border border-neutral-800 bg-neutral-900 px-2.5 font-mono text-xs text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
              <IconPlus className="mr-1 h-3 w-3" />
              create first project
            </Button>
          </CreateProjectDialog>
        )}
      </div>
    </TerminalCard>
  )
}
