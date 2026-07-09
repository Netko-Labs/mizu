import { createLogger } from '@mizu/logger'
import { databaseTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { startContainer, stopContainer } from '../../docker/containers'

const logger = createLogger('service:control-database')

/**
 * Starts a stopped database's Docker container.
 */
export const startDatabase = async (databaseId: string): Promise<void> => {
  const [database] = await db.select().from(databaseTable).where(eq(databaseTable.id, databaseId))

  if (!database) {
    throw new Error('Database not found')
  }

  if (!database.containerId) {
    throw new Error('Database has no container. Deploy first.')
  }

  try {
    await db
      .update(databaseTable)
      .set({ status: 'starting' })
      .where(eq(databaseTable.id, databaseId))

    await startContainer(database.containerId)

    await db
      .update(databaseTable)
      .set({ status: 'running' })
      .where(eq(databaseTable.id, databaseId))

    logger.info({ databaseId, containerId: database.containerId }, 'Database started')
  } catch (error) {
    await db.update(databaseTable).set({ status: 'error' }).where(eq(databaseTable.id, databaseId))

    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error({ databaseId, error: message }, 'Failed to start database')
    throw error
  }
}

/**
 * Stops a running database's Docker container.
 */
export const stopDatabase = async (databaseId: string): Promise<void> => {
  const [database] = await db.select().from(databaseTable).where(eq(databaseTable.id, databaseId))

  if (!database) {
    throw new Error('Database not found')
  }

  if (!database.containerId) {
    throw new Error('Database has no container')
  }

  try {
    await db
      .update(databaseTable)
      .set({ status: 'stopping' })
      .where(eq(databaseTable.id, databaseId))

    await stopContainer(database.containerId)

    await db
      .update(databaseTable)
      .set({ status: 'stopped' })
      .where(eq(databaseTable.id, databaseId))

    logger.info({ databaseId, containerId: database.containerId }, 'Database stopped')
  } catch (error) {
    await db.update(databaseTable).set({ status: 'error' }).where(eq(databaseTable.id, databaseId))

    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error({ databaseId, error: message }, 'Failed to stop database')
    throw error
  }
}
