import type { FormEvent } from 'react'
import type { Team } from '@/components/core/workspace'

export interface WorkspaceSwitcherProps {
  collapsed?: boolean
}

export type ActiveDialog = 'create' | 'edit' | 'delete' | null

export type SwitcherWorkspace = Team

export interface UseWorkspaceCrudResult {
  activeDialog: ActiveDialog
  targetWorkspace: SwitcherWorkspace | null
  name: string
  setName: (name: string) => void
  confirmName: string
  setConfirmName: (name: string) => void
  openCreate: () => void
  openEdit: (workspaceId: string, currentName: string) => void
  openDelete: (workspaceId: string) => void
  closeDialog: () => void
  handleCreate: (e: FormEvent) => Promise<void>
  handleUpdate: (e: FormEvent) => Promise<void>
  handleDelete: () => Promise<void>
  isCreating: boolean
  createError: Error | null
  isUpdating: boolean
  updateError: Error | null
  isDeleting: boolean
  deleteError: Error | null
}

export interface WorkspaceCreateDialogProps {
  open: boolean
  name: string
  onNameChange: (name: string) => void
  onSubmit: (e: FormEvent) => void
  onClose: () => void
  isPending: boolean
  error: Error | null
}

export interface WorkspaceRenameDialogProps {
  open: boolean
  name: string
  targetName: string | undefined
  onNameChange: (name: string) => void
  onSubmit: (e: FormEvent) => void
  onClose: () => void
  isPending: boolean
  error: Error | null
}

export interface WorkspaceDeleteDialogProps {
  open: boolean
  confirmName: string
  targetName: string | undefined
  onConfirmNameChange: (name: string) => void
  onDelete: () => void
  onClose: () => void
  isPending: boolean
  error: Error | null
}
