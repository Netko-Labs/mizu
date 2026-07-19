import { deploymentTable, serviceTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { NotFoundError } from '../../shared/authz'
import { type DeploymentResult, deployService } from '../services/deploy-service'

/**
 * Roll a service back to a previous deployment: write the snapshot back into
 * the service row, then redeploy. Mutating the row is required — the
 * supervisor treats it as desired state (healMissing redeploys from it), so a
 * non-mutating rollback would be reverted on the next reconcile pass.
 *
 * Restores env vars too when the deployment snapshotted them (Railway
 * semantics: rollback restores code + variables).
 */
export const rollbackDeployment = async (
  deploymentId: string,
  userId: string,
): Promise<DeploymentResult> => {
  const [deployment] = await db
    .select()
    .from(deploymentTable)
    .where(eq(deploymentTable.id, deploymentId))
  if (!deployment) throw new NotFoundError('Deployment not found')

  await db
    .update(serviceTable)
    .set({
      sourceConfig: deployment.sourceConfig,
      ...(deployment.envVarsSnapshot ? { envVars: deployment.envVarsSnapshot } : {}),
    })
    .where(eq(serviceTable.id, deployment.serviceId))

  return deployService(deployment.serviceId, { trigger: 'rollback', userId })
}
