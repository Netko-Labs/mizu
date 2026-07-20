import type { Project } from '@mizu/nagare-domain'
import type { Serialized } from '@/shared/api'

export type ProjectDrawerTab = 'settings' | 'yaml' | 'activity'

export interface ProjectDrawerProps {
  project: Serialized<Project>
  tab: ProjectDrawerTab
  onTabChange: (tab: ProjectDrawerTab) => void
  mizuYaml: string
  onClose: () => void
}

export interface ProjectSettingsFormProps {
  project: Serialized<Project>
}
