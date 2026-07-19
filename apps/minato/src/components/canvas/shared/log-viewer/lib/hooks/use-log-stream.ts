import { useQuery } from '@tanstack/react-query'
import { databaseQueries, logQueries, serviceQueries } from '@/shared/api'
import type { UseLogStreamOptions, UseLogStreamResult } from '../types'

const LOG_TAIL = 200
const LOG_POLL_MS = 3000

/**
 * Resolve the entity's container and poll its log tail. One consumer per
 * mounted viewer — the bottom panel and the drawer's Logs tab share this.
 */
export function useLogStream({ serviceId, databaseId }: UseLogStreamOptions): UseLogStreamResult {
  const { data: service } = useQuery({
    ...serviceQueries.byId(serviceId ?? ''),
    enabled: !!serviceId,
  })
  const { data: database } = useQuery({
    ...databaseQueries.byId(databaseId ?? ''),
    enabled: !!databaseId,
  })

  const containerId = (serviceId ? service?.containerId : database?.containerId) ?? null

  const { data: logs, isLoading } = useQuery({
    ...logQueries.byContainer(containerId ?? '', LOG_TAIL),
    enabled: !!containerId,
    refetchInterval: LOG_POLL_MS,
  })

  return {
    containerId,
    logLines: logs?.split('\n').filter(Boolean) ?? [],
    isLoading,
  }
}
