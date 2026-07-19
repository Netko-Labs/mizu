import { queryOptions } from '@tanstack/react-query'
import { nagare } from '@/integrations/nagare'
import { unwrap } from '../utils'

export const variableKeys = {
  all: ['variables'] as const,
  byService: (serviceId: string) => ['variables', 'byService', serviceId] as const,
}

export const variableQueries = {
  /** Decrypted user env vars — connection-injected vars are not included. */
  byService: (serviceId: string) =>
    queryOptions({
      queryKey: variableKeys.byService(serviceId),
      queryFn: async () =>
        (await unwrap(nagare.services({ serviceId })['env-vars'].get())) as unknown as Record<
          string,
          string
        >,
    }),
}

/** Full-replace the map (deletions fall out); applies on next deploy. */
export const updateServiceVariables = async ({
  serviceId,
  variables,
}: {
  serviceId: string
  variables: Record<string, string>
}) =>
  (await unwrap(nagare.services({ serviceId })['env-vars'].put(variables))) as unknown as Record<
    string,
    string
  >
