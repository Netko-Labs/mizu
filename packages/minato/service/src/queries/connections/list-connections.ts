import { type ServiceConnection, serviceConnectionTable, serviceTable } from '@mizu/minato-domain'
import { db } from '@mizu/minato-repository'
import { eq, or } from 'drizzle-orm'

/**
 * List all connections for a specific service.
 * Returns both outgoing connections (where this service is the source)
 * and incoming connections (where this service is the target).
 */
export const listConnectionsForService = async (
  serviceId: string,
): Promise<ServiceConnection[]> => {
  const results = await db
    .select()
    .from(serviceConnectionTable)
    .where(
      or(
        eq(serviceConnectionTable.fromServiceId, serviceId),
        eq(serviceConnectionTable.toServiceId, serviceId),
      ),
    )
  return results as ServiceConnection[]
}

/**
 * List all connections within a project.
 * Joins through the service table to find all connections
 * where the source service belongs to the specified project.
 */
export const listConnectionsForProject = async (
  projectId: string,
): Promise<ServiceConnection[]> => {
  const results = await db
    .select({
      id: serviceConnectionTable.id,
      fromServiceId: serviceConnectionTable.fromServiceId,
      toServiceId: serviceConnectionTable.toServiceId,
      toDatabaseId: serviceConnectionTable.toDatabaseId,
      targetType: serviceConnectionTable.targetType,
      connectionType: serviceConnectionTable.connectionType,
      envVarName: serviceConnectionTable.envVarName,
      createdAt: serviceConnectionTable.createdAt,
    })
    .from(serviceConnectionTable)
    .innerJoin(serviceTable, eq(serviceConnectionTable.fromServiceId, serviceTable.id))
    .where(eq(serviceTable.projectId, projectId))
  return results as ServiceConnection[]
}
