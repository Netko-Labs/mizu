import { createLogger } from '@mizu/logger'
import { type DatabaseStatus, databaseTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { getContainerStatus } from '../../runtime'

const logger = createLogger('service:get-database-status')

/** Map Docker container state to Mizu database status */
function mapRuntimeState(state: string): DatabaseStatus {
  switch (state) {
    case 'running':
      return 'running'
    case 'created':
      return 'created'
    case 'stopping':
      return 'stopping'
    case 'stopped':
      return 'stopped'
    default:
      return 'error'
  }
}

/**
 * Gets the current status of a database.
 * If the database has a containerId, queries the runtime for live status and syncs DB if drifted.
 */
export const getDatabaseStatus = async (
  databaseId: string,
): Promise<DatabaseStatus | undefined> => {
  const [result] = await db
    .select({ status: databaseTable.status, containerId: databaseTable.containerId })
    .from(databaseTable)
    .where(eq(databaseTable.id, databaseId))

  if (!result) {
    return undefined
  }

  if (!result.containerId) {
    return result.status as DatabaseStatus
  }

  try {
    const containerStatus = await getContainerStatus(result.containerId)
    const liveStatus = mapRuntimeState(containerStatus.state)

    // Sync DB if status drifted
    if (liveStatus !== result.status) {
      await db
        .update(databaseTable)
        .set({ status: liveStatus })
        .where(eq(databaseTable.id, databaseId))
    }

    return liveStatus
  } catch (error) {
    logger.debug(
      { databaseId, containerId: result.containerId, error },
      'Failed to query Docker for database status, using stored status',
    )
    return result.status as DatabaseStatus
  }
}
