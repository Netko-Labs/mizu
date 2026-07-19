import { createLogger } from '@mizu/logger'
import { type DeploymentInsert, deploymentTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { and, desc, eq, notInArray } from 'drizzle-orm'
import { DEPLOYMENT_HISTORY_LIMIT } from './constants'

const logger = createLogger('service:record-deployment')

/**
 * Append a deployment history row and prune the service's history to the last
 * DEPLOYMENT_HISTORY_LIMIT entries. Never throws — history must not fail a
 * deploy.
 */
export const recordDeployment = async (input: DeploymentInsert): Promise<void> => {
  try {
    await db.insert(deploymentTable).values(input)

    const keep = db
      .select({ id: deploymentTable.id })
      .from(deploymentTable)
      .where(eq(deploymentTable.serviceId, input.serviceId))
      .orderBy(desc(deploymentTable.createdAt))
      .limit(DEPLOYMENT_HISTORY_LIMIT)
    await db
      .delete(deploymentTable)
      .where(
        and(eq(deploymentTable.serviceId, input.serviceId), notInArray(deploymentTable.id, keep)),
      )
  } catch (error) {
    logger.warn(
      { serviceId: input.serviceId, error: error instanceof Error ? error.message : String(error) },
      'Failed to record deployment history',
    )
  }
}
