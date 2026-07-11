import { createLogger } from '@mizu/logger'
import { type Service, serviceTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { syncIngressSafe } from '../../ingress'
import { removeContainer, stopContainer } from '../../runtime'

const logger = createLogger('service:delete-service')

/**
 * Deletes a service. If it has a running container, stops and removes it first.
 */
export const deleteService = async (serviceId: string): Promise<Service | undefined> => {
  const [service] = await db.select().from(serviceTable).where(eq(serviceTable.id, serviceId))

  if (!service) {
    return undefined
  }

  // Clean up Docker container if it exists
  if (service.containerId) {
    try {
      await stopContainer(service.containerId)
    } catch {
      // Container may already be stopped or removed
    }
    try {
      await removeContainer(service.containerId, true)
    } catch (error) {
      logger.warn(
        { serviceId, containerId: service.containerId, error },
        'Failed to remove container during service deletion',
      )
    }
  }

  const [result] = await db.delete(serviceTable).where(eq(serviceTable.id, serviceId)).returning()
  logger.info({ serviceId }, 'Service deleted')
  syncIngressSafe()
  return result as Service | undefined
}
