import { createLogger } from '@mizu/logger'
import { type ServiceStatus, serviceTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { getContainerStatus } from '../../docker/containers'

const logger = createLogger('service:get-service-status')

/** Map Docker container state to Mizu service status */
function mapDockerState(state: string): ServiceStatus {
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
 * Gets the current status of a service.
 * If the service has a containerId, queries Docker for live status and syncs DB if drifted.
 */
export const getServiceStatus = async (serviceId: string): Promise<ServiceStatus | undefined> => {
  const [result] = await db
    .select({ status: serviceTable.status, containerId: serviceTable.containerId })
    .from(serviceTable)
    .where(eq(serviceTable.id, serviceId))

  if (!result) {
    return undefined
  }

  if (!result.containerId) {
    return result.status as ServiceStatus
  }

  try {
    const containerStatus = await getContainerStatus(result.containerId)
    const liveStatus = mapDockerState(containerStatus.state)

    // Sync DB if status drifted
    if (liveStatus !== result.status) {
      await db
        .update(serviceTable)
        .set({ status: liveStatus })
        .where(eq(serviceTable.id, serviceId))
    }

    return liveStatus
  } catch (error) {
    logger.debug(
      { serviceId, containerId: result.containerId, error },
      'Failed to query Docker for service status, using stored status',
    )
    return result.status as ServiceStatus
  }
}
