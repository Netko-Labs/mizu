import { createLogger } from '@mizu/logger'
import { type ActivityInsert, activityTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { and, desc, eq, notInArray } from 'drizzle-orm'
import { ACTIVITY_RETENTION_LIMIT } from './constants'

const logger = createLogger('service:record-activity')

/**
 * Append a feed entry and prune the project's feed to the newest
 * ACTIVITY_RETENTION_LIMIT rows. Never throws — a feed write must never break
 * the mutation it narrates. Callers fire-and-forget (`void recordActivity(...)`).
 */
export const recordActivity = async (input: ActivityInsert): Promise<void> => {
  try {
    await db.insert(activityTable).values(input)

    const keep = db
      .select({ id: activityTable.id })
      .from(activityTable)
      .where(eq(activityTable.projectId, input.projectId))
      .orderBy(desc(activityTable.createdAt))
      .limit(ACTIVITY_RETENTION_LIMIT)
    await db
      .delete(activityTable)
      .where(and(eq(activityTable.projectId, input.projectId), notInArray(activityTable.id, keep)))
  } catch (error) {
    logger.warn(
      { projectId: input.projectId, error: error instanceof Error ? error.message : String(error) },
      'Failed to record activity',
    )
  }
}
