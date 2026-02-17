import { createLogger } from '@mizu/logger'
import { type DatabaseStatus, databaseTable } from '@mizu/minato-domain'
import { db } from '@mizu/minato-repository'
import { eq } from 'drizzle-orm'
import { getContainerStatus } from '../../docker/containers'

const logger = createLogger('service:get-database-status')

/** Map Docker container state to Mizu database status */
function mapDockerState(state: string): DatabaseStatus {
  switch (state) {
    case 'running':
      return 'running'
    case 'created':
      return 'created'
    case 'restarting':
      return 'starting'
    case 'paused':
    case 'exited':
    case 'dead':
      return 'stopped'
    default:
      return 'error'
  }
}

/**
 * Gets the current status of a database.
 * If the database has a containerId, queries Docker for live status and syncs DB if drifted.
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
    const liveStatus = mapDockerState(containerStatus.state)

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
