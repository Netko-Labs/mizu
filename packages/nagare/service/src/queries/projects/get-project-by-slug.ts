import { type Project, projectTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { and, eq } from 'drizzle-orm'

export const getProjectBySlug = async (
  organizationId: string,
  slug: string,
): Promise<Project | undefined> => {
  const [result] = await db
    .select()
    .from(projectTable)
    .where(and(eq(projectTable.organizationId, organizationId), eq(projectTable.slug, slug)))
  return result as Project | undefined
}
