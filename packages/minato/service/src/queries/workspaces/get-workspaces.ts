import { type Workspace, workspaceTable } from '@mizu/minato-domain'
import { db } from '@mizu/minato-repository'
import { eq } from 'drizzle-orm'

export const getWorkspaces = async (userId: string): Promise<Workspace[]> => {
  const results = await db
    .select()
    .from(workspaceTable)
    .where(eq(workspaceTable.userId, userId))
    .orderBy(workspaceTable.createdAt)

  return results as Workspace[]
}
