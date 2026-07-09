import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'
import { useWorkspace } from '@/components/core/workspace'
import { createWorkspace, deleteWorkspace, updateWorkspace, workspaceKeys } from '@/shared/api'
import type { ActiveDialog, UseWorkspaceCrudResult } from '../types'

export function useWorkspaceCrud(): UseWorkspaceCrudResult {
  const queryClient = useQueryClient()
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null)
  const [targetWorkspaceId, setTargetWorkspaceId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [confirmName, setConfirmName] = useState('')

  const { workspaces, currentWorkspace, setCurrentWorkspaceId } = useWorkspace()

  const targetWorkspace =
    (targetWorkspaceId ? workspaces.find((w) => w.id === targetWorkspaceId) : null) ?? null

  const invalidateList = () => queryClient.invalidateQueries({ queryKey: workspaceKeys.all })

  const createMutation = useMutation({ mutationFn: createWorkspace, onSuccess: invalidateList })
  const updateMutation = useMutation({ mutationFn: updateWorkspace, onSuccess: invalidateList })
  const deleteMutation = useMutation({ mutationFn: deleteWorkspace, onSuccess: invalidateList })

  // --- Dialog helpers ---

  const openCreate = () => {
    setName('')
    setActiveDialog('create')
  }

  const openEdit = (workspaceId: string, currentName: string) => {
    setTargetWorkspaceId(workspaceId)
    setName(currentName)
    setActiveDialog('edit')
  }

  const openDelete = (workspaceId: string) => {
    setTargetWorkspaceId(workspaceId)
    setConfirmName('')
    setActiveDialog('delete')
  }

  const closeDialog = () => {
    setActiveDialog(null)
    setTargetWorkspaceId(null)
    setName('')
    setConfirmName('')
    createMutation.reset()
    updateMutation.reset()
    deleteMutation.reset()
  }

  // --- Handlers ---

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      const workspace = await createMutation.mutateAsync({ name: name.trim() })
      setCurrentWorkspaceId(workspace.id)
      closeDialog()
    } catch {
      // error shown via mutation state
    }
  }

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !targetWorkspaceId) return
    try {
      await updateMutation.mutateAsync({ workspaceId: targetWorkspaceId, name: name.trim() })
      closeDialog()
    } catch {
      // error shown via mutation state
    }
  }

  const handleDelete = async () => {
    if (!targetWorkspaceId) return
    try {
      await deleteMutation.mutateAsync(targetWorkspaceId)
      if (targetWorkspaceId === currentWorkspace?.id) {
        const remaining = workspaces.find((w) => w.id !== targetWorkspaceId)
        if (remaining) setCurrentWorkspaceId(remaining.id)
      }
      closeDialog()
    } catch {
      // error shown via mutation state
    }
  }

  return {
    activeDialog,
    targetWorkspace,
    name,
    setName,
    confirmName,
    setConfirmName,
    openCreate,
    openEdit,
    openDelete,
    closeDialog,
    handleCreate,
    handleUpdate,
    handleDelete,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  }
}
