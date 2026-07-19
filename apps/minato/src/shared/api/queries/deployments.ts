import type { DeploymentListItem } from '@mizu/nagare-domain'
import { queryOptions } from '@tanstack/react-query'
import { nagare } from '@/integrations/nagare'
import type { Serialized } from '../types'
import { unwrap } from '../utils'

// eden types drizzle timestamps as Date, but JSON delivers ISO strings —
// Serialized<> is the honest wire type (see ../types.ts).

export const deploymentKeys = {
  all: ['deployments'] as const,
  byService: (serviceId: string) => ['deployments', 'byService', serviceId] as const,
}

export const deploymentQueries = {
  byService: (serviceId: string) =>
    queryOptions({
      queryKey: deploymentKeys.byService(serviceId),
      queryFn: async () =>
        (await unwrap(
          nagare.deployments.get({ query: { serviceId, limit: 30 } }),
        )) as unknown as Serialized<DeploymentListItem>[],
    }),
}

export const rollbackDeployment = ({ deploymentId }: { deploymentId: string }) =>
  unwrap(nagare.deployments({ deploymentId }).rollback.post())
