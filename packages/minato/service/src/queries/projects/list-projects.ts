import { type Project, projectTable } from '@mizu/minato-domain'
import { db } from '@mizu/minato-repository'
import { and, eq } from 'drizzle-orm'

export const listProjects = async (userId: string, workspaceId: string): Promise<Project[]> => {
  const results = await db
    .select()
    .from(projectTable)
    .where(and(eq(projectTable.userId, userId), eq(projectTable.workspaceId, workspaceId)))
  return results as Project[]
}
