import type { Service } from '@mizu/nagare-domain'
import { queryOptions } from '@tanstack/react-query'
import { nagare } from '@/integrations/nagare'
import type {
  CreateServiceParams,
  Serialized,
  ServicePositionParams,
  UpdateServiceParams,
} from '../types'
import { unwrap } from '../utils'

// eden types drizzle timestamps as Date, but JSON delivers ISO strings —
// Serialized<> is the honest wire type (see ../types.ts).

export const serviceKeys = {
  all: ['services'] as const,
  list: (projectId: string) => ['services', 'list', projectId] as const,
  byId: (serviceId: string) => ['services', serviceId] as const,
  status: (serviceId: string) => ['services', serviceId, 'status'] as const,
}

export const serviceQueries = {
  list: (projectId: string) =>
    queryOptions({
      queryKey: serviceKeys.list(projectId),
      queryFn: async () =>
        (await unwrap(
          nagare.services.get({ query: { projectId } }),
        )) as unknown as Serialized<Service>[],
    }),
  byId: (serviceId: string) =>
    queryOptions({
      queryKey: serviceKeys.byId(serviceId),
      queryFn: async () =>
        (await unwrap(nagare.services({ serviceId }).get())) as unknown as
          | Serialized<Service>
          | undefined,
    }),
  status: (serviceId: string) =>
    queryOptions({
      queryKey: serviceKeys.status(serviceId),
      queryFn: () => unwrap(nagare.services({ serviceId }).status.get()),
    }),
}

export const createService = async (input: CreateServiceParams) =>
  (await unwrap(nagare.services.post(input))) as unknown as Serialized<Service> | undefined

export const updateService = async ({ serviceId, ...body }: UpdateServiceParams) =>
  (await unwrap(nagare.services({ serviceId }).patch(body))) as unknown as
    | Serialized<Service>
    | undefined

export const updateServicePosition = ({ serviceId, position }: ServicePositionParams) =>
  unwrap(nagare.services({ serviceId }).position.patch({ position }))

export const deleteService = (serviceId: string) => unwrap(nagare.services({ serviceId }).delete())

export const deployService = (serviceId: string) =>
  unwrap(nagare.services({ serviceId }).deploy.post())

export const startService = (serviceId: string) =>
  unwrap(nagare.services({ serviceId }).start.post())

export const stopService = (serviceId: string) => unwrap(nagare.services({ serviceId }).stop.post())

export const restartService = (serviceId: string) =>
  unwrap(nagare.services({ serviceId }).restart.post())
