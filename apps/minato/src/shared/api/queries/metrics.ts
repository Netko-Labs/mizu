import type { ServiceMetrics } from '@mizu/nagare-domain'
import { queryOptions } from '@tanstack/react-query'
import { nagare } from '@/integrations/nagare'
import { unwrap } from '../utils'

export const metricKeys = {
  all: ['metrics'] as const,
  byService: (serviceId: string) => ['metrics', 'byService', serviceId] as const,
}

export const metricQueries = {
  /** ~1h CPU/mem window; consumers add refetchInterval to stay live. */
  byService: (serviceId: string) =>
    queryOptions({
      queryKey: metricKeys.byService(serviceId),
      queryFn: async () =>
        (await unwrap(nagare.services({ serviceId }).metrics.get())) as unknown as ServiceMetrics,
    }),
}
