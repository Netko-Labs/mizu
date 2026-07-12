import {
  type Database,
  databaseTable,
  type Project,
  projectTable,
  type Service,
  serviceTable,
} from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { and, eq } from 'drizzle-orm'

export interface ProjectWithServices extends Project {
  services: Service[]
  databases: Database[]
}

/**
 * A project plus the services & databases of one environment. When
 * `environmentId` is omitted, every environment's entities are returned (used
 * only where the caller genuinely wants the whole project).
 */
export const getProjectWithServices = async (
  projectId: string,
  environmentId?: string,
): Promise<ProjectWithServices | undefined> => {
  const [project] = await db.select().from(projectTable).where(eq(projectTable.id, projectId))

  if (!project) {
    return undefined
  }

  const serviceWhere = environmentId
    ? and(eq(serviceTable.projectId, projectId), eq(serviceTable.environmentId, environmentId))
    : eq(serviceTable.projectId, projectId)
  const databaseWhere = environmentId
    ? and(eq(databaseTable.projectId, projectId), eq(databaseTable.environmentId, environmentId))
    : eq(databaseTable.projectId, projectId)

  const [services, databases] = await Promise.all([
    db.select().from(serviceTable).where(serviceWhere),
    db.select().from(databaseTable).where(databaseWhere),
  ])

  return {
    ...(project as Project),
    services: services as Service[],
    databases: databases as Database[],
  }
}
