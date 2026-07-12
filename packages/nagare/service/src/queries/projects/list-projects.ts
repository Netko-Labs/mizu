import { type Project, projectTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'

export const listProjects = async (organizationId: string): Promise<Project[]> => {
  const results = await db
    .select()
    .from(projectTable)
    .where(eq(projectTable.organizationId, organizationId))
  return results as Project[]
}
