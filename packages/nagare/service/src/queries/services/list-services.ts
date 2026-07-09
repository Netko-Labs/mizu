import { type Service, serviceTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'

export const listServices = async (projectId: string): Promise<Service[]> => {
  const results = await db.select().from(serviceTable).where(eq(serviceTable.projectId, projectId))
  return results as Service[]
}
