import type { Database, Service, ServiceSourceType } from '@mizu/nagare-domain'
import type { ReactNode, RefObject } from 'react'
import type { Serialized } from '@/shared/api'

export type PropertyAction =
  | { type: 'updateName'; name: string }
  | { type: 'updateSourceConfig'; sourceConfig: { image: string; tag?: string } }
  | {
      type: 'updateCredentials'
      credentials: { username: string; password: string; database: string }
    }
  | { type: 'delete' }
  | { type: 'deploy' }
  | { type: 'start' }
  | { type: 'stop' }
  | { type: 'restart' }

export interface NodePropertyEditorProps {
  nodeId: string
  service: Serialized<Service> | null
  database: Serialized<Database> | null
  nodeType: 'service' | 'database' | null
  onClose: () => void
  onAction?: (action: PropertyAction) => void
  isActionPending?: boolean
}

export interface ServicePropertiesProps {
  service: Serialized<Service>
  onAction?: (action: PropertyAction) => void
  isActionPending?: boolean
}

export interface DatabasePropertiesProps {
  database: Serialized<Database>
  onAction?: (action: PropertyAction) => void
  isActionPending?: boolean
}

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
