'use client'

import type { Workspace } from '@mizu/nagare-domain'
import { useQuery } from '@tanstack/react-query'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { type Serialized, workspaceQueries } from '@/shared/api'

interface WorkspaceContextValue {
  workspaces: Serialized<Workspace>[]
  currentWorkspaceId: string | null
  currentWorkspace: Serialized<Workspace> | null
  setCurrentWorkspaceId: (workspaceId: string) => void
  isLoading: boolean
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

const STORAGE_KEY = 'mizu.currentWorkspaceId'

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useQuery(workspaceQueries.list())
  const workspaces = data ?? []
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null)

  useEffect(() => {
    if (workspaces.length === 0) {
      setCurrentWorkspaceId(null)
      return
    }

    const storedId = window.localStorage.getItem(STORAGE_KEY)
    const hasStored = storedId && workspaces.some((workspace) => workspace.id === storedId)

    if (hasStored) {
      setCurrentWorkspaceId(storedId)
      return
    }

    setCurrentWorkspaceId((previous) => {
      if (previous && workspaces.some((workspace) => workspace.id === previous)) {
        return previous
      }
      return workspaces[0].id
    })
  }, [workspaces])

  useEffect(() => {
    if (!currentWorkspaceId) return
    window.localStorage.setItem(STORAGE_KEY, currentWorkspaceId)
  }, [currentWorkspaceId])

  const currentWorkspace = useMemo(() => {
    if (!currentWorkspaceId) return null
    return workspaces.find((workspace) => workspace.id === currentWorkspaceId) ?? null
  }, [workspaces, currentWorkspaceId])

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspaces,
      currentWorkspaceId,
      currentWorkspace,
      setCurrentWorkspaceId,
      isLoading,
    }),
    [workspaces, currentWorkspaceId, currentWorkspace, isLoading],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)

  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }

  return context
}
