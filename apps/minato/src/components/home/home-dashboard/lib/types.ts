import type { Project } from '@mizu/nagare-domain'
import type { Serialized } from '@/shared/api'

export type RecentProject = Serialized<Project>

export interface ProjectItemProps {
  name: string
  slug: string
  description?: string | null
  delay?: number
}

export interface HomeRecentProjectsProps {
  projects: RecentProject[]
  isLoading: boolean
  hasWorkspace: boolean
}
