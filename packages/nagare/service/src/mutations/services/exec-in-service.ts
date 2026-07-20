import { type ExecResult, serviceTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { execCommandInContainer } from '../../runtime'
import { ConflictError, NotFoundError } from '../../shared/authz'

/** Run a one-shot shell command in the service's running container. */
export const execInService = async (serviceId: string, command: string): Promise<ExecResult> => {
  const [service] = await db
    .select({ containerId: serviceTable.containerId, status: serviceTable.status })
    .from(serviceTable)
    .where(eq(serviceTable.id, serviceId))
  if (!service) throw new NotFoundError('Service not found')
  if (!service.containerId || service.status !== 'running') {
    throw new ConflictError('Service is not running — start it to use the console')
  }
  return execCommandInContainer(service.containerId, command)
}
