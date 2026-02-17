import { type Project, projectTable } from '@mizu/minato-domain'
import { db } from '@mizu/minato-repository'
import { eq } from 'drizzle-orm'

export const getProject = async (projectId: string): Promise<Project | undefined> => {
  const [result] = await db.select().from(projectTable).where(eq(projectTable.id, projectId))
  return result as Project | undefined
}
