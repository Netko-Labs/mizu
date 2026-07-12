import type { Environment } from '@mizu/nagare-domain'
import { queryOptions } from '@tanstack/react-query'
import { nagare } from '@/integrations/nagare'
import type { Serialized } from '../types'
import { unwrap } from '../utils'

// A project's deployment environments (production/staging/…). The active one
// scopes the canvas graph; see the environment switcher.

export const environmentKeys = {
  all: ['environments'] as const,
  list: (projectId: string) => ['environments', 'list', projectId] as const,
}

export const environmentQueries = {
  list: (projectId: string) =>
    queryOptions({
      queryKey: environmentKeys.list(projectId),
      queryFn: async () =>
        (await unwrap(
          nagare.environments.get({ query: { projectId } }),
        )) as unknown as Serialized<Environment>[],
    }),
}

export const createEnvironment = async (input: { projectId: string; name: string }) =>
  (await unwrap(nagare.environments.post(input))) as unknown as Serialized<Environment>

export const renameEnvironment = async ({
  environmentId,
  name,
}: {
  environmentId: string
  name: string
}) =>
  (await unwrap(
    nagare.environments({ environmentId }).patch({ name }),
  )) as unknown as Serialized<Environment>

export const deleteEnvironment = (environmentId: string) =>
  unwrap(nagare.environments({ environmentId }).delete())
