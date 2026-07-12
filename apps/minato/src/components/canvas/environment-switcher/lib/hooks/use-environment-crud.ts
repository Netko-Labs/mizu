import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'
import {
  createEnvironment,
  deleteEnvironment,
  environmentKeys,
  renameEnvironment,
} from '@/shared/api'
import type { EnvDialogMode } from '../types'

/**
 * Create/rename/delete dialog state + mutations for a project's environments,
 * with react-query invalidation so the switcher list stays fresh.
 */
export function useEnvironmentCrud(projectId: string, onCreated?: (id: string) => void) {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<EnvDialogMode>(null)
  const [targetId, setTargetId] = useState<string | null>(null)
  const [name, setName] = useState('')

  const invalidate = () => queryClient.invalidateQueries({ queryKey: environmentKeys.all })
  const createMut = useMutation({ mutationFn: createEnvironment, onSuccess: invalidate })
  const renameMut = useMutation({ mutationFn: renameEnvironment, onSuccess: invalidate })
  const deleteMut = useMutation({ mutationFn: deleteEnvironment, onSuccess: invalidate })

  const openCreate = () => {
    setName('')
    setMode('create')
  }
  const openRename = (id: string, current: string) => {
    setTargetId(id)
    setName(current)
    setMode('rename')
  }
  const openDelete = (id: string) => {
    setTargetId(id)
    setMode('delete')
  }
  const close = () => {
    setMode(null)
    setTargetId(null)
    setName('')
    createMut.reset()
    renameMut.reset()
    deleteMut.reset()
  }

  const submitName = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      if (mode === 'create') {
        const env = await createMut.mutateAsync({ projectId, name: name.trim() })
        onCreated?.(env.id)
      } else if (mode === 'rename' && targetId) {
        await renameMut.mutateAsync({ environmentId: targetId, name: name.trim() })
      }
      close()
    } catch {
      // error surfaced via mutation state
    }
  }

  const confirmDelete = async () => {
    if (!targetId) return
    try {
      await deleteMut.mutateAsync(targetId)
      close()
    } catch {
      // error surfaced via mutation state
    }
  }

  return {
    mode,
    name,
    setName,
    targetId,
    openCreate,
    openRename,
    openDelete,
    close,
    submitName,
    confirmDelete,
    isSubmitting: createMut.isPending || renameMut.isPending,
    submitError: createMut.error ?? renameMut.error,
    isDeleting: deleteMut.isPending,
    deleteError: deleteMut.error,
  }
}
