import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { updateServiceVariables, variableKeys, variableQueries } from '@/shared/api'
import type { UseVariablesEditorOptions, UseVariablesEditorResult } from '../types'

const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/

/**
 * Draft-map editor over the service's user env vars: local edits, dirty diff
 * against the server map, single save committing the whole map (full replace —
 * deletions fall out naturally).
 */
export function useVariablesEditor({
  serviceId,
}: UseVariablesEditorOptions): UseVariablesEditorResult {
  const queryClient = useQueryClient()
  const { data: serverVars, isLoading } = useQuery(variableQueries.byService(serviceId))
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [savedPendingDeploy, setSavedPendingDeploy] = useState(false)

  useEffect(() => {
    if (serverVars) setDraft(serverVars)
  }, [serverVars])

  const mutation = useMutation({
    mutationFn: (variables: Record<string, string>) =>
      updateServiceVariables({ serviceId, variables }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variableKeys.byService(serviceId) })
      setSavedPendingDeploy(true)
    },
  })

  const dirty = JSON.stringify(draft) !== JSON.stringify(serverVars ?? {})

  return {
    isLoading,
    draft,
    dirty,
    setVariable: (name, value) => {
      setSavedPendingDeploy(false)
      setDraft((prev) => ({ ...prev, [name]: value }))
    },
    removeVariable: (name) => {
      setSavedPendingDeploy(false)
      setDraft((prev) => {
        const { [name]: _, ...rest } = prev
        return rest
      })
    },
    addVariable: (name, value) => {
      if (!NAME_PATTERN.test(name) || name in draft) return false
      setSavedPendingDeploy(false)
      setDraft((prev) => ({ ...prev, [name]: value }))
      return true
    },
    save: () => mutation.mutate(draft),
    isSaving: mutation.isPending,
    savedPendingDeploy,
  }
}
