import { IconChevronRight, IconFolder } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import type { ProjectItemProps } from '../lib/types'

export function ProjectItem({ name, slug, description, delay = 0 }: ProjectItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Link to="/projects/$slug" params={{ slug }}>
        <div className="group rounded-lg border border-neutral-800 bg-neutral-950 p-3 transition-all hover:border-neutral-700 hover:bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-black">
              <IconFolder className="h-4 w-4 text-neutral-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-neutral-300 group-hover:text-white">{name}</p>
              {description && (
                <p className="truncate text-[10px] text-neutral-600">{description}</p>
              )}
            </div>
            <IconChevronRight className="size-3 text-neutral-700 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-500" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
