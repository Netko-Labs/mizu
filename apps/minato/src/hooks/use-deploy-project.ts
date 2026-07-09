import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { deployDatabase, deployService, projectKeys, projectQueries } from '@/shared/api'

export type DeployEntityStatus = 'pending' | 'deploying' | 'success' | 'error'

export interface DeployEntity {
  id: string
  name: string
  type: 'service' | 'database'
  status: DeployEntityStatus
  error?: string
}

export function useDeployProject(projectId: string) {
  const queryClient = useQueryClient()
  const [entities, setEntities] = useState<DeployEntity[]>([])
  const [isDeploying, setIsDeploying] = useState(false)

  const { data: project } = useQuery(projectQueries.withServices(projectId))

  const deployServiceMutation = useMutation({ mutationFn: deployService })

  const deployDatabaseMutation = useMutation({ mutationFn: deployDatabase })

  const buildEntities = useCallback((): DeployEntity[] => {
    if (!project) return []

    const dbEntities: DeployEntity[] =
      project.databases?.map((db) => ({
        id: db.id,
        name: db.name,
        type: 'database' as const,
        status: db.status === 'running' ? ('success' as const) : ('pending' as const),
      })) ?? []

    const serviceEntities: DeployEntity[] =
      project.services?.map((svc) => ({
        id: svc.id,
        name: svc.name,
        type: 'service' as const,
        status: svc.status === 'running' ? ('success' as const) : ('pending' as const),
      })) ?? []

    return [...dbEntities, ...serviceEntities]
  }, [project])

  const deployAll = useCallback(async () => {
    const deployList = buildEntities()
    setEntities(deployList)
    setIsDeploying(true)

    // Deploy databases first (dependencies)
    for (const entity of deployList) {
      if (entity.type !== 'database' || entity.status === 'success') continue

      setEntities((prev) =>
        prev.map((e) => (e.id === entity.id ? { ...e, status: 'deploying' } : e)),
      )

      try {
        await deployDatabaseMutation.mutateAsync(entity.id)
        setEntities((prev) =>
          prev.map((e) => (e.id === entity.id ? { ...e, status: 'success' } : e)),
        )
      } catch (err) {
        setEntities((prev) =>
          prev.map((e) =>
            e.id === entity.id
              ? { ...e, status: 'error', error: err instanceof Error ? err.message : 'unknown' }
              : e,
          ),
        )
      }
    }

    // Then deploy services
    for (const entity of deployList) {
      if (entity.type !== 'service' || entity.status === 'success') continue

      setEntities((prev) =>
        prev.map((e) => (e.id === entity.id ? { ...e, status: 'deploying' } : e)),
      )

      try {
        await deployServiceMutation.mutateAsync(entity.id)
        setEntities((prev) =>
          prev.map((e) => (e.id === entity.id ? { ...e, status: 'success' } : e)),
        )
      } catch (err) {
        setEntities((prev) =>
          prev.map((e) =>
            e.id === entity.id
              ? { ...e, status: 'error', error: err instanceof Error ? err.message : 'unknown' }
              : e,
          ),
        )
      }
    }

    setIsDeploying(false)

    // Refresh project data
    queryClient.invalidateQueries({
      queryKey: projectKeys.withServices(projectId),
    })
  }, [buildEntities, deployDatabaseMutation, deployServiceMutation, projectId, queryClient])

  return {
    entities,
    isDeploying,
    deployAll,
    buildEntities,
    setEntities,
  }
}
