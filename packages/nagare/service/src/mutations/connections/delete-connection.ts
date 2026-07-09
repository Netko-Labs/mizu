import { serviceConnectionTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'

export const deleteConnection = async (connectionId: string): Promise<void> => {
  await db.delete(serviceConnectionTable).where(eq(serviceConnectionTable.id, connectionId))
}
