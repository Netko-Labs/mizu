import type { ServiceConnection } from '@mizu/nagare-domain'
import { queryOptions } from '@tanstack/react-query'
import { nagare } from '@/integrations/nagare'
import type { CreateConnectionInput, Serialized } from '../types'
import { unwrap } from '../utils'

// eden types drizzle timestamps as Date, but JSON delivers ISO strings —
// Serialized<> is the honest wire type (see ../types.ts).

export const connectionKeys = {
  all: ['connections'] as const,
  forService: (serviceId: string) => ['connections', 'for-service', serviceId] as const,
  forProject: (projectId: string) => ['connections', 'for-project', projectId] as const,
}

export const connectionQueries = {
  forService: (serviceId: string) =>
    queryOptions({
      queryKey: connectionKeys.forService(serviceId),
      queryFn: async () =>
        (await unwrap(
          nagare.connections['for-service']({ serviceId }).get(),
        )) as unknown as Serialized<ServiceConnection>[],
    }),
  forProject: (projectId: string) =>
    queryOptions({
      queryKey: connectionKeys.forProject(projectId),
      queryFn: async () =>
        (await unwrap(
          nagare.connections['for-project']({ projectId }).get(),
        )) as unknown as Serialized<ServiceConnection>[],
    }),
}

export const createConnection = async (input: CreateConnectionInput) =>
  (await unwrap(nagare.connections.post(input))) as unknown as
    | Serialized<ServiceConnection>
    | undefined

export const deleteConnection = (connectionId: string) =>
  unwrap(nagare.connections({ connectionId }).delete())
