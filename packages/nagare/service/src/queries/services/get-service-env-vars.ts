import { serviceTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { parseUserEnvVars } from '../../shared/env-vars'

/**
 * The service's user-defined env vars, decrypted. Connection-resolved vars are
 * injected at deploy time and are not part of this map.
 */
export const getServiceEnvVars = async (
  serviceId: string,
): Promise<Record<string, string> | undefined> => {
  const [service] = await db
    .select({ envVars: serviceTable.envVars })
    .from(serviceTable)
    .where(eq(serviceTable.id, serviceId))
  if (!service) return undefined
  return parseUserEnvVars(service.envVars)
}
