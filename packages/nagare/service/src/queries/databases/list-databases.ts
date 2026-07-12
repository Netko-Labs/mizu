import { type Database, databaseTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { and, eq } from 'drizzle-orm'

export const listDatabases = async (
  projectId: string,
  environmentId?: string,
): Promise<Database[]> => {
  const where = environmentId
    ? and(eq(databaseTable.projectId, projectId), eq(databaseTable.environmentId, environmentId))
    : eq(databaseTable.projectId, projectId)
  return await db.select().from(databaseTable).where(where)
}
