import { type Database, databaseTable } from '@mizu/minato-domain'
import { db } from '@mizu/minato-repository'
import { eq } from 'drizzle-orm'

export const getDatabase = async (databaseId: string): Promise<Database | undefined> => {
  return await db
    .select()
    .from(databaseTable)
    .where(eq(databaseTable.id, databaseId))
    .then(([result]) => result)
}
