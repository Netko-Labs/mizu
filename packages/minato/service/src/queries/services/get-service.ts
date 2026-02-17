import { type Service, serviceTable } from '@mizu/minato-domain'
import { db } from '@mizu/minato-repository'
import { eq } from 'drizzle-orm'

export const getService = async (serviceId: string): Promise<Service | undefined> => {
  const [result] = await db.select().from(serviceTable).where(eq(serviceTable.id, serviceId))
  return result as Service | undefined
}
