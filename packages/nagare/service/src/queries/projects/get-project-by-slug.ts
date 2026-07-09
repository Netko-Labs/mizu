import { type Project, projectTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { and, eq } from 'drizzle-orm'

export const getProjectBySlug = async (
  userId: string,
  workspaceId: string,
  slug: string,
): Promise<Project | undefined> => {
  const [result] = await db
    .select()
    .from(projectTable)
    .where(
      and(
        eq(projectTable.userId, userId),
        eq(projectTable.workspaceId, workspaceId),
        eq(projectTable.slug, slug),
      ),
    )
  return result as Project | undefined
}
