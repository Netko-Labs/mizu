import type { Service } from '@mizu/nagare-domain'
import type { PropertyAction } from '@/components/canvas/lib'
import type { Serialized } from '@/shared/api'

export interface VariablesTabProps {
  service: Serialized<Service>
  onAction?: (action: PropertyAction) => void
}

export interface VariableRowProps {
  name: string
  value: string
  onChange: (value: string) => void
  onRemove: () => void
}

export interface UseVariablesEditorOptions {
  serviceId: string
}

export interface UseVariablesEditorResult {
  isLoading: boolean
  /** Current draft, seeded from the server map. */
  draft: Record<string, string>
  dirty: boolean
  setVariable: (name: string, value: string) => void
  removeVariable: (name: string) => void
  addVariable: (name: string, value: string) => boolean
  save: () => void
  isSaving: boolean
  /** True right after a successful save — vars apply on next deploy. */
  savedPendingDeploy: boolean
}
