import { createLogger } from '@mizu/logger'
import { serviceTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { restartContainer, startContainer, stopContainer } from '../../docker/containers'

const logger = createLogger('service:control-service')

/**
 * Starts a stopped service's Docker container.
 */
export const startService = async (serviceId: string): Promise<void> => {
  const [service] = await db.select().from(serviceTable).where(eq(serviceTable.id, serviceId))

  if (!service) {
    throw new Error('Service not found')
  }

  if (!service.containerId) {
    throw new Error('Service has no container. Deploy first.')
  }

  try {
    await db.update(serviceTable).set({ status: 'starting' }).where(eq(serviceTable.id, serviceId))

    await startContainer(service.containerId)

    await db.update(serviceTable).set({ status: 'running' }).where(eq(serviceTable.id, serviceId))

    logger.info({ serviceId, containerId: service.containerId }, 'Service started')
  } catch (error) {
    await db.update(serviceTable).set({ status: 'error' }).where(eq(serviceTable.id, serviceId))

    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error({ serviceId, error: message }, 'Failed to start service')
    throw error
  }
}

/**
 * Stops a running service's Docker container.
 */
export const stopService = async (serviceId: string): Promise<void> => {
  const [service] = await db.select().from(serviceTable).where(eq(serviceTable.id, serviceId))

  if (!service) {
    throw new Error('Service not found')
  }

  if (!service.containerId) {
    throw new Error('Service has no container')
  }

  try {
    await db.update(serviceTable).set({ status: 'stopping' }).where(eq(serviceTable.id, serviceId))

    await stopContainer(service.containerId)

    await db.update(serviceTable).set({ status: 'stopped' }).where(eq(serviceTable.id, serviceId))

    logger.info({ serviceId, containerId: service.containerId }, 'Service stopped')
  } catch (error) {
    await db.update(serviceTable).set({ status: 'error' }).where(eq(serviceTable.id, serviceId))

    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error({ serviceId, error: message }, 'Failed to stop service')
    throw error
  }
}

/**
 * Restarts a service's Docker container.
 */
export const restartService = async (serviceId: string): Promise<void> => {
  const [service] = await db.select().from(serviceTable).where(eq(serviceTable.id, serviceId))

  if (!service) {
    throw new Error('Service not found')
  }

  if (!service.containerId) {
    throw new Error('Service has no container. Deploy first.')
  }

  try {
    await db.update(serviceTable).set({ status: 'stopping' }).where(eq(serviceTable.id, serviceId))

    await restartContainer(service.containerId)

    await db.update(serviceTable).set({ status: 'running' }).where(eq(serviceTable.id, serviceId))

    logger.info({ serviceId, containerId: service.containerId }, 'Service restarted')
  } catch (error) {
    await db.update(serviceTable).set({ status: 'error' }).where(eq(serviceTable.id, serviceId))

    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error({ serviceId, error: message }, 'Failed to restart service')
    throw error
  }
}
