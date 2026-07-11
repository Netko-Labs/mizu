import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useWorkspace } from '@/components/core/workspace'
import { useSession } from '@/integrations/auth/client'
import { initializeMizu, projectQueries, systemQueries } from '@/shared/api'
import { buildHostBand, buildMeterTiles, buildRuntimeLines } from '../utils'

export function useHomeDashboard() {
  const { data: session } = useSession()
  const { currentWorkspace, isLoading: isWorkspaceLoading } = useWorkspace()

  const { data: stats, isLoading: isStatsLoading } = useQuery(systemQueries.dashboardStats())

  const { data: projects = [], isLoading: isProjectsLoading } = useQuery({
    ...projectQueries.list(currentWorkspace?.id ?? ''),
    enabled: Boolean(currentWorkspace),
  })

  // First-run setup is a POST with side effects now — fire it once per mount.
  const { mutate: runInitialize } = useMutation({ mutationFn: initializeMizu })
  const initialized = useRef(false)
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    runInitialize()
  }, [runInitialize])

  const recentProjects = projects.slice(0, 4)
  const isLoading = isStatsLoading || isWorkspaceLoading
  const firstName = session?.user?.name?.split(' ')[0] || 'user'

  return {
    isLoading,
    firstName,
    recentProjects,
    isProjectsLoading,
    isWorkspaceLoading,
    hasWorkspace: Boolean(currentWorkspace),
    host: stats ? buildHostBand(stats) : null,
    tiles: stats ? buildMeterTiles(stats) : [],
    tailnet: stats?.mizu.tailscale ?? null,
    runtimeLines: stats ? buildRuntimeLines(stats) : [],
  }
}
