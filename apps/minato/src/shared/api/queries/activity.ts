import type { Activity } from '@mizu/nagare-domain'
import { queryOptions } from '@tanstack/react-query'
import { nagare } from '@/integrations/nagare'
import type { Serialized } from '../types'
import { unwrap } from '../utils'

export interface ActivityPage {
  items: Serialized<Activity>[]
  /** ISO createdAt cursor for the next (older) page, null at the end. */
  nextCursor: string | null
}

export const activityKeys = {
  all: ['activity'] as const,
  byProject: (projectId: string) => ['activity', 'byProject', projectId] as const,
}

export const activityQueries = {
  /** Newest-first feed page; consumers add refetchInterval to stay live. */
  byProject: (projectId: string) =>
    queryOptions({
      queryKey: activityKeys.byProject(projectId),
      queryFn: async () =>
        (await unwrap(
          nagare.activities.get({ query: { projectId, limit: 50 } }),
        )) as unknown as ActivityPage,
    }),
}
