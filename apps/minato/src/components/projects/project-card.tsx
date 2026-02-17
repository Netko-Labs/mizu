import type { Project } from '@mizu/minato-domain'
import { IconChevronRight, IconFolder } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'

interface ProjectCardProps {
  project: Project
  delay?: number
}

function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays}d ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears}y ago`
}

export function ProjectCard({ project, delay = 0 }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Link to="/projects/$slug" params={{ slug: project.slug }}>
        <div className="group cursor-pointer rounded-lg border border-neutral-800 bg-neutral-950 p-4 font-mono transition-all hover:border-neutral-700 hover:bg-neutral-900">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-black">
              <IconFolder className="h-4 w-4 text-neutral-500" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-neutral-300 group-hover:text-white">
                  {project.name}
                </p>
                <IconChevronRight className="size-3 text-neutral-700 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-500" />
              </div>
              {project.description && (
                <p className="mt-1 line-clamp-2 text-[10px] text-neutral-600">
                  {project.description}
                </p>
              )}
              <p className="mt-2 text-[10px] text-neutral-700">
                updated {formatRelativeTime(project.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
