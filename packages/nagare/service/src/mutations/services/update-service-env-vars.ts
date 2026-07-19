import { serviceTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { encrypt } from '../../shared/crypto'

/**
 * Full-replace the service's user env vars (encrypted at rest). Takes effect
 * on the next deploy — the running container keeps its env until then.
 */
export const updateServiceEnvVars = async (
  serviceId: string,
  vars: Record<string, string>,
): Promise<Record<string, string> | undefined> => {
  const [result] = await db
    .update(serviceTable)
    .set({ envVars: encrypt(JSON.stringify(vars)) })
    .where(eq(serviceTable.id, serviceId))
    .returning({ id: serviceTable.id })
  if (!result) return undefined
  return vars
}
