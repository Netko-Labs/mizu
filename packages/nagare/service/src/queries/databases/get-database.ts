import { type Database, databaseTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'

export const getDatabase = async (databaseId: string): Promise<Database | undefined> => {
  return await db
    .select()
    .from(databaseTable)
    .where(eq(databaseTable.id, databaseId))
    .then(([result]) => result)
}
