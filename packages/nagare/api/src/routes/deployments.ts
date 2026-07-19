import { DeploymentListQuerySchema } from '@mizu/nagare-domain'
import {
  assertDeploymentOwned,
  assertServiceOwned,
  listDeployments,
  rollbackDeployment,
} from '@mizu/nagare-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'
import { logServiceActivity } from '../shared/activity'

export const deploymentsRoutes = new Elysia({ name: 'deployments', prefix: '/deployments' })
  .use(authPlugin)
  // 📜 a service's deployment history, newest first
  .get('/', { auth: true, query: DeploymentListQuerySchema }, async ({ user, query }) => {
    await assertServiceOwned(query.serviceId, user.organizationId)
    return listDeployments(query.serviceId, query.limit)
  })
  // ⏪ roll the service back to this deployment's snapshot and redeploy
  .post('/:deploymentId/rollback', { auth: true }, async ({ user, params }) => {
    const deployment = await assertDeploymentOwned(params.deploymentId, user.organizationId)
    const service = await assertServiceOwned(deployment.serviceId, user.organizationId)
    logServiceActivity(service, user, 'service.rollback', { deploymentId: deployment.id })
    return rollbackDeployment(params.deploymentId, user.id)
  })
