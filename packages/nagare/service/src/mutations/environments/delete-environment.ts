import { createLogger } from '@mizu/logger'
import { databaseTable, environmentTable, serviceTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { ConflictError } from '../../shared'
import { deleteDatabase } from '../databases/delete-database'
import { deleteService } from '../services/delete-service'

const logger = createLogger('service:delete-environment')

/**
 * Delete an environment and everything deployed in it. The default environment
 * can't be deleted. Services and databases are torn down through their own
 * delete paths first, so their containers are stopped/removed rather than
 * orphaned by the DB cascade.
 */
export const deleteEnvironment = async (id: string): Promise<void> => {
  const [environment] = await db
    .select()
    .from(environmentTable)
    .where(eq(environmentTable.id, id))
    .limit(1)

  if (!environment) return
  if (environment.isDefault) {
    throw new ConflictError('Cannot delete the default environment')
  }

  const services = await db
    .select({ id: serviceTable.id })
    .from(serviceTable)
    .where(eq(serviceTable.environmentId, id))
  for (const service of services) {
    await deleteService(service.id)
  }

  const databases = await db
    .select({ id: databaseTable.id })
    .from(databaseTable)
    .where(eq(databaseTable.environmentId, id))
  for (const database of databases) {
    await deleteDatabase(database.id)
  }

  await db.delete(environmentTable).where(eq(environmentTable.id, id))
  logger.info({ environmentId: id }, 'Environment deleted')
}
