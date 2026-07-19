import { type DeploymentListItem, deploymentTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { desc, eq } from 'drizzle-orm'

/**
 * A service's deployment history, newest first. Explicit column list — the
 * encrypted env snapshot never leaves the daemon.
 */
export const listDeployments = async (
  serviceId: string,
  limit: number,
): Promise<DeploymentListItem[]> => {
  return db
    .select({
      id: deploymentTable.id,
      serviceId: deploymentTable.serviceId,
      projectId: deploymentTable.projectId,
      environmentId: deploymentTable.environmentId,
      status: deploymentTable.status,
      error: deploymentTable.error,
      sourceConfig: deploymentTable.sourceConfig,
      trigger: deploymentTable.trigger,
      triggeredBy: deploymentTable.triggeredBy,
      containerId: deploymentTable.containerId,
      createdAt: deploymentTable.createdAt,
    })
    .from(deploymentTable)
    .where(eq(deploymentTable.serviceId, serviceId))
    .orderBy(desc(deploymentTable.createdAt))
    .limit(limit)
}
