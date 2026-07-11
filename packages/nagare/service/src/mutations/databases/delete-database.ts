import { createLogger } from '@mizu/logger'
import { type Database, databaseTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { removeContainer, stopContainer } from '../../runtime'

const logger = createLogger('service:delete-database')

/**
 * Deletes a database. If it has a running container, stops and removes it first.
 * Named data volumes are intentionally preserved for safety.
 */
export const deleteDatabase = async (databaseId: string): Promise<Database | undefined> => {
  const [database] = await db.select().from(databaseTable).where(eq(databaseTable.id, databaseId))

  if (!database) {
    return undefined
  }

  // Clean up Docker container if it exists
  if (database.containerId) {
    try {
      await stopContainer(database.containerId)
    } catch {
      // Container may already be stopped or removed
    }
    try {
      await removeContainer(database.containerId, true)
    } catch (error) {
      logger.warn(
        { databaseId, containerId: database.containerId, error },
        'Failed to remove container during database deletion',
      )
    }
  }

  const [result] = await db
    .delete(databaseTable)
    .where(eq(databaseTable.id, databaseId))
    .returning()

  logger.info({ databaseId }, 'Database deleted')
  return result as Database | undefined
}
