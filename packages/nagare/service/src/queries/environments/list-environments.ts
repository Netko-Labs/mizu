import { type Environment, environmentTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { desc, eq } from 'drizzle-orm'

/** All environments in a project, default first, then newest. */
export const listEnvironments = async (projectId: string): Promise<Environment[]> => {
  const results = await db
    .select()
    .from(environmentTable)
    .where(eq(environmentTable.projectId, projectId))
    .orderBy(desc(environmentTable.isDefault), desc(environmentTable.createdAt))

  return results as Environment[]
}
