import { type Service, serviceTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { and, eq } from 'drizzle-orm'

export const listServices = async (
  projectId: string,
  environmentId?: string,
): Promise<Service[]> => {
  const where = environmentId
    ? and(eq(serviceTable.projectId, projectId), eq(serviceTable.environmentId, environmentId))
    : eq(serviceTable.projectId, projectId)
  const results = await db.select().from(serviceTable).where(where)
  return results as Service[]
}
