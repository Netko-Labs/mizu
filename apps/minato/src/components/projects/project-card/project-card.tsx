import { IconChevronRight } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { formatRelativeTime } from '@/shared/format-date'
import type { ProjectCardProps } from './types'

export function ProjectCard({ project, delay = 0 }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
    >
      <Link to="/projects/$slug" params={{ slug: project.slug }}>
        <div className="group cursor-pointer rounded-lg border border-neutral-800 bg-neutral-950 p-4 font-mono transition-colors hover:border-neutral-700 hover:border-l-blue-500/40 hover:bg-neutral-900">
          <p className="truncate text-sm leading-tight text-white">{project.name}</p>
          <p className="mt-1 truncate text-[11px] text-neutral-500">{project.description ?? '—'}</p>
          <div className="mt-3 flex items-center justify-between text-[10px] text-neutral-600">
            <span>updated {formatRelativeTime(project.updatedAt)}</span>
            <IconChevronRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
