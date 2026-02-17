import { projectTable } from '@mizu/minato-domain'
import { db } from '@mizu/minato-repository'
import { eq } from 'drizzle-orm'

export const deleteProject = async (projectId: string): Promise<void> => {
  // TODO: Stop and remove all containers for this project
  // This will be implemented when Docker integration is added
  // 1. Get all services and databases for this project
  // 2. Stop and remove each container
  // 3. Remove the Docker network

  // Delete project (cascades to services and databases via DB constraints)
  await db.delete(projectTable).where(eq(projectTable.id, projectId))
}
