import { IconFolder, IconPlus } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { CreateProjectDialog } from '@/components/projects/create-project-dialog'
import { LeaderLine, TerminalCard } from '@/components/shared/terminal'
import type { HomeQuickActionsProps } from '../lib/types'

export function HomeQuickActions({ runtimeLines }: HomeQuickActionsProps) {
  return (
    <div className="flex flex-col gap-4">
      <TerminalCard title="commands.sh" delay={0.3}>
        <div className="grid gap-3 sm:grid-cols-2">
          <CreateProjectDialog>
            <button
              type="button"
              className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-black p-4 text-left transition-all hover:border-neutral-700 hover:bg-neutral-900"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 text-blue-500">
                <IconPlus className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs text-neutral-300">mizu new</div>
                <div className="text-[10px] text-neutral-600">create project</div>
              </div>
            </button>
          </CreateProjectDialog>
          <Link to="/projects">
            <div className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-black p-4 transition-all hover:border-neutral-700 hover:bg-neutral-900">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-500">
                <IconFolder className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs text-neutral-300">mizu ls</div>
                <div className="text-[10px] text-neutral-600">list projects</div>
              </div>
            </div>
          </Link>
        </div>
      </TerminalCard>

      <TerminalCard title="runtime.info" delay={0.3} className="flex-1">
        <div className="space-y-1.5">
          {runtimeLines.map((line) => (
            <LeaderLine
              key={line.label}
              label={line.label}
              value={line.value}
              accent={line.accent}
            />
          ))}
        </div>
      </TerminalCard>
    </div>
  )
}
