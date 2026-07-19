import { useQuery } from '@tanstack/react-query'
import { activityQueries } from '@/shared/api'
import type { ActivityDayGroup, UseProjectActivityResult } from '../types'
import { ACTIVITY_POLL_MS } from '../values'

function dayLabel(iso: string): string {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

/** The project feed, polled live and grouped by day for rendering. */
export function useProjectActivity(projectId: string): UseProjectActivityResult {
  const { data, isLoading } = useQuery({
    ...activityQueries.byProject(projectId),
    refetchInterval: ACTIVITY_POLL_MS,
  })

  const groups: ActivityDayGroup[] = []
  for (const item of data?.items ?? []) {
    const label = dayLabel(item.createdAt)
    const group = groups.at(-1)
    if (group?.label === label) group.items.push(item)
    else groups.push({ label, items: [item] })
  }

  return { groups, isLoading }
}
