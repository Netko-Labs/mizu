import { useMutation } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'
import { useWorkspace } from '@/components/core/workspace'
import { organization } from '@/integrations/auth'
import type { ActiveDialog, UseWorkspaceCrudResult } from '../types'

// A url-safe, reasonably-unique slug for a new team (better-auth requires one).
function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${base || 'team'}-${crypto.randomUUID().slice(0, 8)}`
}

// better-auth client methods resolve to `{ data, error }` rather than throwing;
// await + unwrap so react-query sees a rejected promise on failure.
async function unwrapAuth<T>(
  call: Promise<{ data: T | null; error: { message?: string } | null }>,
): Promise<T | null> {
  const { data, error } = await call
  if (error) throw new Error(error.message ?? 'request failed')
  return data
}

export function useWorkspaceCrud(): UseWorkspaceCrudResult {
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null)
  const [targetWorkspaceId, setTargetWorkspaceId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [confirmName, setConfirmName] = useState('')

  const { workspaces, currentWorkspace, setCurrentWorkspaceId } = useWorkspace()

  const targetWorkspace =
    (targetWorkspaceId ? workspaces.find((w) => w.id === targetWorkspaceId) : null) ?? null

  const createMutation = useMutation({
    mutationFn: (teamName: string) =>
      unwrapAuth(organization.create({ name: teamName, slug: slugify(teamName) })),
  })
  const updateMutation = useMutation({
    mutationFn: ({ organizationId, teamName }: { organizationId: string; teamName: string }) =>
      unwrapAuth(organization.update({ organizationId, data: { name: teamName } })),
  })
  const deleteMutation = useMutation({
    mutationFn: (organizationId: string) => unwrapAuth(organization.delete({ organizationId })),
  })

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
      const team = await createMutation.mutateAsync(name.trim())
      if (team) setCurrentWorkspaceId(team.id)
      closeDialog()
    } catch {
      // error shown via mutation state
    }
  }

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !targetWorkspaceId) return
    try {
      await updateMutation.mutateAsync({ organizationId: targetWorkspaceId, teamName: name.trim() })
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
