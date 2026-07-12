import { motion } from 'motion/react'
import type { DashboardStatlineProps } from '../lib/types'

export function DashboardStatline({ workspaceName, projectCount }: DashboardStatlineProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.2 }}
      className="mb-5 flex items-center gap-8 text-[11px]"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="shrink-0 text-neutral-600">team</span>
        <span aria-hidden className="min-w-4 flex-1 border-b border-dotted border-neutral-800" />
        <span className="truncate text-neutral-400">{workspaceName}</span>
      </div>
      <div className="flex flex-1 items-center gap-2">
        <span className="shrink-0 text-neutral-600">projects</span>
        <span aria-hidden className="min-w-4 flex-1 border-b border-dotted border-neutral-800" />
        <span className="text-blue-500">{projectCount}</span>
      </div>
    </motion.div>
  )
}
