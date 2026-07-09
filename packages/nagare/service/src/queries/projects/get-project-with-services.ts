import {
  type Database,
  databaseTable,
  type Project,
  projectTable,
  type Service,
  serviceTable,
} from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'

export interface ProjectWithServices extends Project {
  services: Service[]
  databases: Database[]
}

export const getProjectWithServices = async (
  projectId: string,
): Promise<ProjectWithServices | undefined> => {
  const [project] = await db.select().from(projectTable).where(eq(projectTable.id, projectId))

  if (!project) {
    return undefined
  }

  const [services, databases] = await Promise.all([
    db.select().from(serviceTable).where(eq(serviceTable.projectId, projectId)),
    db.select().from(databaseTable).where(eq(databaseTable.projectId, projectId)),
  ])

  return {
    ...(project as Project),
    services: services as Service[],
    databases: databases as Database[],
  }
}
