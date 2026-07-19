import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { deploymentKeys, projectKeys, rollbackDeployment } from '@/shared/api'
import type { UseRollbackOptions, UseRollbackResult } from '../types'

/** Rollback confirm state + mutation (refreshes history + the canvas graph). */
export function useRollback({ serviceId, projectId }: UseRollbackOptions): UseRollbackResult {
  const queryClient = useQueryClient()
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (deploymentId: string) => rollbackDeployment({ deploymentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deploymentKeys.byService(serviceId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.withServices(projectId) })
    },
  })

  return {
    confirmId,
    setConfirmId,
    rollback: (deploymentId: string) => {
      setConfirmId(null)
      mutation.mutate(deploymentId)
    },
    isPending: mutation.isPending,
  }
}
