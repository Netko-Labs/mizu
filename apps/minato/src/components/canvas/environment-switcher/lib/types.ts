import type { Environment } from '@mizu/nagare-domain'
import type { Serialized } from '@/shared/api'

export type SwitcherEnvironment = Serialized<Environment>

export interface EnvironmentSwitcherProps {
  projectId: string
  environments: SwitcherEnvironment[]
  activeEnvironmentId: string | null
  onSelect: (environmentId: string) => void
}

export type EnvDialogMode = 'create' | 'rename' | 'delete' | null
