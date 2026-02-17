import { type Service, type ServiceInsert, serviceTable } from '@mizu/minato-domain'
import { db } from '@mizu/minato-repository'

export const createService = async (data: ServiceInsert): Promise<Service | undefined> => {
  const [result] = await db.insert(serviceTable).values(data).returning()
  return result as Service | undefined
}
