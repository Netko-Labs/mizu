import type { SwitcherEnvironment } from '@/components/canvas/environment-switcher/lib'

export interface CanvasViewProps {
  projectId: string
  projectName: string
}

export interface CanvasViewInnerProps extends CanvasViewProps {
  environments: SwitcherEnvironment[]
  activeEnvironmentId: string
  onEnvironmentChange: (id: string) => void
}
