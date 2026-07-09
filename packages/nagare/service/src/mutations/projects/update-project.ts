import { type Project, type ProjectUpdate, projectTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'

export const updateProject = async (
  projectId: string,
  data: Partial<ProjectUpdate>,
): Promise<Project | undefined> => {
  const [result] = await db
    .update(projectTable)
    .set(data)
    .where(eq(projectTable.id, projectId))
    .returning()
  return result as Project | undefined
}
