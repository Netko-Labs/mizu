import type { Database } from '@mizu/nagare-domain'
import { queryOptions } from '@tanstack/react-query'
import { nagare } from '@/integrations/nagare'
import type {
  CreateDatabaseParams,
  DatabasePositionParams,
  Serialized,
  UpdateDatabaseParams,
} from '../types'
import { unwrap } from '../utils'

// eden types drizzle timestamps as Date, but JSON delivers ISO strings —
// Serialized<> is the honest wire type (see ../types.ts).

export const databaseKeys = {
  all: ['databases'] as const,
  list: (projectId: string) => ['databases', 'list', projectId] as const,
  byId: (databaseId: string) => ['databases', databaseId] as const,
  status: (databaseId: string) => ['databases', databaseId, 'status'] as const,
  connectionInfo: (databaseId: string) => ['databases', databaseId, 'connection-info'] as const,
}

export const databaseQueries = {
  list: (projectId: string) =>
    queryOptions({
      queryKey: databaseKeys.list(projectId),
      queryFn: async () =>
        (await unwrap(
          nagare.databases.get({ query: { projectId } }),
        )) as unknown as Serialized<Database>[],
    }),
  byId: (databaseId: string) =>
    queryOptions({
      queryKey: databaseKeys.byId(databaseId),
      queryFn: async () =>
        (await unwrap(nagare.databases({ databaseId }).get())) as unknown as
          | Serialized<Database>
          | undefined,
    }),
  status: (databaseId: string) =>
    queryOptions({
      queryKey: databaseKeys.status(databaseId),
      queryFn: () => unwrap(nagare.databases({ databaseId }).status.get()),
    }),
  connectionInfo: (databaseId: string) =>
    queryOptions({
      queryKey: databaseKeys.connectionInfo(databaseId),
      queryFn: () => unwrap(nagare.databases({ databaseId })['connection-info'].get()),
    }),
}

export const createDatabase = async (input: CreateDatabaseParams) =>
  (await unwrap(nagare.databases.post(input))) as unknown as Serialized<Database> | undefined

export const updateDatabase = async ({ databaseId, ...body }: UpdateDatabaseParams) =>
  (await unwrap(nagare.databases({ databaseId }).patch(body))) as unknown as
    | Serialized<Database>
    | undefined

export const updateDatabasePosition = ({ databaseId, position }: DatabasePositionParams) =>
  unwrap(nagare.databases({ databaseId }).position.patch({ position }))

export const deleteDatabase = (databaseId: string) =>
  unwrap(nagare.databases({ databaseId }).delete())

export const deployDatabase = (databaseId: string) =>
  unwrap(nagare.databases({ databaseId }).deploy.post())

export const startDatabase = (databaseId: string) =>
  unwrap(nagare.databases({ databaseId }).start.post())

export const stopDatabase = (databaseId: string) =>
  unwrap(nagare.databases({ databaseId }).stop.post())
