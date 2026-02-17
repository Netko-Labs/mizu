import {
  type ServiceConnection,
  type ServiceConnectionInsert,
  serviceConnectionTable,
} from '@mizu/minato-domain'
import { db } from '@mizu/minato-repository'

export const createConnection = async (
  data: ServiceConnectionInsert,
): Promise<ServiceConnection | undefined> => {
  const [result] = await db.insert(serviceConnectionTable).values(data).returning()
  return result as ServiceConnection | undefined
}
