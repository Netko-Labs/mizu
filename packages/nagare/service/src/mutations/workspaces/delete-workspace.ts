import { workspaceTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { and, eq } from 'drizzle-orm'

export const deleteWorkspace = async (workspaceId: string, userId: string): Promise<void> => {
  await db
    .delete(workspaceTable)
    .where(and(eq(workspaceTable.id, workspaceId), eq(workspaceTable.userId, userId)))
}
