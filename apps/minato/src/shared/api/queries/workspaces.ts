import type { Workspace } from '@mizu/nagare-domain'
import { queryOptions } from '@tanstack/react-query'
import { nagare } from '@/integrations/nagare'
import type { CreateWorkspaceInput, Serialized, UpdateWorkspaceParams } from '../types'
import { unwrap } from '../utils'

// eden types drizzle timestamps as Date, but JSON delivers ISO strings —
// Serialized<> is the honest wire type (see ../types.ts).

export const workspaceKeys = {
  all: ['workspaces'] as const,
  list: () => ['workspaces', 'list'] as const,
}

export const workspaceQueries = {
  list: () =>
    queryOptions({
      queryKey: workspaceKeys.list(),
      queryFn: async () =>
        (await unwrap(nagare.workspaces.get())) as unknown as Serialized<Workspace>[],
    }),
}

export const createWorkspace = async (input: CreateWorkspaceInput) =>
  (await unwrap(nagare.workspaces.post(input))) as unknown as Serialized<Workspace>

export const updateWorkspace = async ({ workspaceId, ...body }: UpdateWorkspaceParams) =>
  (await unwrap(nagare.workspaces({ workspaceId }).patch(body))) as unknown as Serialized<Workspace>

export const deleteWorkspace = (workspaceId: string) =>
  unwrap(nagare.workspaces({ workspaceId }).delete())
