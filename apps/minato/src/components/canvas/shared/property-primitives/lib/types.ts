import type { ServiceSourceType } from '@mizu/nagare-domain'
import type { ReactNode, RefObject } from 'react'

export interface SectionHeaderProps {
  title: string
}

export interface PropertyLineProps {
  label: string
  value: string | number | null | undefined
  accent?: boolean
  mono?: boolean
  copyable?: boolean
}

export interface EditablePropertyLineProps {
  label: string
  value: string
  onSave: (value: string) => void
}

export interface ActionButtonProps {
  label: string
  icon: ReactNode
  onClick: () => void
  destructive?: boolean
  disabled?: boolean
}

export interface SourceTypeIconProps {
  type: ServiceSourceType
}

export interface UseEditablePropertyOptions {
  value: string
  onSave: (value: string) => void
}

export interface UseEditablePropertyResult {
  editing: boolean
  draft: string
  setDraft: (value: string) => void
  inputRef: RefObject<HTMLInputElement | null>
  handleSave: () => void
  startEditing: () => void
  cancelEditing: () => void
}
