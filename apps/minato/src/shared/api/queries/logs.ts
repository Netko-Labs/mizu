import { queryOptions } from '@tanstack/react-query'
import { nagare } from '@/integrations/nagare'
import { unwrap } from '../utils'

export const logKeys = {
  all: ['logs'] as const,
  byContainer: (containerId: string, tail: number) => ['logs', containerId, tail] as const,
}

export const logQueries = {
  byContainer: (containerId: string, tail = 100) =>
    queryOptions({
      queryKey: logKeys.byContainer(containerId, tail),
      queryFn: () => unwrap(nagare.logs({ containerId }).get({ query: { tail } })),
    }),
}
