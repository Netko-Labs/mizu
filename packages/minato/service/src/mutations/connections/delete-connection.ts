import { serviceConnectionTable } from '@mizu/minato-domain'
import { db } from '@mizu/minato-repository'
import { eq } from 'drizzle-orm'

export const deleteConnection = async (connectionId: string): Promise<void> => {
  await db.delete(serviceConnectionTable).where(eq(serviceConnectionTable.id, connectionId))
}
