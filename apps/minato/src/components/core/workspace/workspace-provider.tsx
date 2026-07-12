'use client'

import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo } from 'react'
import { authClient, organization } from '@/integrations/auth'
import { projectKeys } from '@/shared/api'

// A team is a better-auth organization. We keep the `workspace` vocabulary in
// this provider's public surface so the many consumers stay untouched, but the
// data now comes from better-auth's org plugin — the active team lives in the
// session (`activeOrganizationId`), not localStorage.
export interface Team {
  id: string
  name: string
  slug: string
}

interface WorkspaceContextValue {
  workspaces: Team[]
  currentWorkspaceId: string | null
  currentWorkspace: Team | null
  setCurrentWorkspaceId: (organizationId: string) => void
  isLoading: boolean
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const { data: teams, isPending: teamsPending } = authClient.useListOrganizations()
  const { data: activeTeam, isPending: activePending } = authClient.useActiveOrganization()

  const value = useMemo<WorkspaceContextValue>(() => {
    const workspaces = (teams ?? []) as Team[]
    const currentWorkspace = (activeTeam as Team | null) ?? null

    return {
      workspaces,
      currentWorkspaceId: currentWorkspace?.id ?? null,
      currentWorkspace,
      // Switching the active team persists to the session; the per-request JWT
      // mint then carries the new org to nagare. Invalidate project caches so
      // they refetch under the new tenant.
      setCurrentWorkspaceId: (organizationId: string) => {
        void organization
          .setActive({ organizationId })
          .then(() => queryClient.invalidateQueries({ queryKey: projectKeys.all }))
      },
      isLoading: teamsPending || activePending,
    }
  }, [teams, activeTeam, teamsPending, activePending, queryClient])

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)

  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }

  return context
}
