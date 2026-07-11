import { IconPlus } from '@tabler/icons-react'
import { motion } from 'motion/react'
import { CreateProjectDialog } from '@/components/projects/create-project-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { DashboardHeaderProps } from '../lib/types'

export function DashboardHeader({
  searchQuery,
  onSearchChange,
  searchDisabled = false,
  showToolbar = true,
}: DashboardHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="mb-4 flex flex-wrap items-end justify-between gap-3"
    >
      <div>
        <div className="text-[10px] text-neutral-600">$ mizu ls --projects</div>
        <h1 className="mt-1 text-lg leading-tight text-white">projects</h1>
      </div>

      {showToolbar && (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-56 items-center gap-2 rounded-md border border-neutral-800 bg-neutral-950 px-2 transition-colors focus-within:border-neutral-700">
            <span className="shrink-0 text-[10px] text-neutral-700">$ grep -i</span>
            <Input
              placeholder="search projects..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-full border-0 bg-transparent px-0 text-xs text-neutral-300 placeholder:text-neutral-700 focus-visible:ring-0"
              disabled={searchDisabled}
            />
          </div>
          <CreateProjectDialog>
            <Button
              size="sm"
              className="h-7 rounded-md border border-neutral-800 bg-neutral-900 px-2.5 font-mono text-xs text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
              <IconPlus className="mr-1 h-3 w-3" />$ mizu new
            </Button>
          </CreateProjectDialog>
        </div>
      )}
    </motion.header>
  )
}
