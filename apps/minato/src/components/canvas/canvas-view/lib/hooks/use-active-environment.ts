import type { Environment } from '@mizu/nagare-domain'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { environmentQueries, type Serialized } from '@/shared/api'

const storageKey = (projectId: string) => `mizu.activeEnv.${projectId}`

export interface ActiveEnvironment {
  environments: Serialized<Environment>[]
  activeEnvironmentId: string | null
  setActiveEnvironmentId: (id: string) => void
  isLoading: boolean
}

/**
 * The active deployment environment for a project's canvas. Persists the choice
 * in localStorage per project; defaults to the project's default environment.
 */
export function useActiveEnvironment(projectId: string): ActiveEnvironment {
  const { data, isLoading } = useQuery(environmentQueries.list(projectId))
  const environments = data ?? []
  const [activeEnvironmentId, setId] = useState<string | null>(null)

  useEffect(() => {
    if (environments.length === 0) return
    setId((prev) => {
      if (prev && environments.some((e) => e.id === prev)) return prev
      const stored = window.localStorage.getItem(storageKey(projectId))
      if (stored && environments.some((e) => e.id === stored)) return stored
      return (environments.find((e) => e.isDefault) ?? environments[0]).id
    })
  }, [environments, projectId])

  const setActiveEnvironmentId = useCallback(
    (id: string) => {
      window.localStorage.setItem(storageKey(projectId), id)
      setId(id)
    },
    [projectId],
  )

  return { environments, activeEnvironmentId, setActiveEnvironmentId, isLoading }
}
