import { type Database, databaseTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'

export const listDatabases = async (projectId: string): Promise<Database[]> => {
  return await db.select().from(databaseTable).where(eq(databaseTable.projectId, projectId))
}
