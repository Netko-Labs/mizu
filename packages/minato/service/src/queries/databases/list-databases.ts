import { type Database, databaseTable } from '@mizu/minato-domain'
import { db } from '@mizu/minato-repository'
import { eq } from 'drizzle-orm'

export const listDatabases = async (projectId: string): Promise<Database[]> => {
  return await db.select().from(databaseTable).where(eq(databaseTable.projectId, projectId))
}
