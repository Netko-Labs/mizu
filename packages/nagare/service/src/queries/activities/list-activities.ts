import { type Activity, activityTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { and, desc, eq, lt } from 'drizzle-orm'

export interface ActivityPage {
  items: Activity[]
  /** ISO createdAt of the last item — pass as `before` for the next page. */
  nextCursor: string | null
}

/**
 * A project's activity feed, newest first, cursor-paginated by createdAt
 * (append-only feed → timestamp cursor beats offset).
 */
export const listActivities = async (
  projectId: string,
  limit: number,
  before?: string,
): Promise<ActivityPage> => {
  const rows = await db
    .select()
    .from(activityTable)
    .where(
      and(
        eq(activityTable.projectId, projectId),
        before ? lt(activityTable.createdAt, new Date(before)) : undefined,
      ),
    )
    .orderBy(desc(activityTable.createdAt))
    .limit(limit + 1)

  const items = rows.slice(0, limit)
  const nextCursor = rows.length > limit ? (items.at(-1)?.createdAt.toISOString() ?? null) : null
  return { items, nextCursor }
}
