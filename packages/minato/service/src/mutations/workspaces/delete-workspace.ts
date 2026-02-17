import { workspaceTable } from '@mizu/minato-domain'
import { db } from '@mizu/minato-repository'
import { and, eq } from 'drizzle-orm'

export const deleteWorkspace = async (workspaceId: string, userId: string): Promise<void> => {
  await db
    .delete(workspaceTable)
    .where(and(eq(workspaceTable.id, workspaceId), eq(workspaceTable.userId, userId)))
}
