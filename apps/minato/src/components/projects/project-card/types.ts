import type { Project } from '@mizu/nagare-domain'
import type { Serialized } from '@/shared/api'

export interface ProjectCardProps {
  project: Serialized<Project>
  delay?: number
}
