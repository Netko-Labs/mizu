import { DeploymentListQuerySchema } from '@mizu/nagare-domain'
import {
  assertDeploymentOwned,
  assertServiceOwned,
  listDeployments,
  rollbackDeployment,
} from '@mizu/nagare-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

export const deploymentsRoutes = new Elysia({ name: 'deployments', prefix: '/deployments' })
  .use(authPlugin)
  // 📜 a service's deployment history, newest first
  .get('/', { auth: true, query: DeploymentListQuerySchema }, async ({ user, query }) => {
    await assertServiceOwned(query.serviceId, user.organizationId)
    return listDeployments(query.serviceId, query.limit)
  })
  // ⏪ roll the service back to this deployment's snapshot and redeploy
  .post('/:deploymentId/rollback', { auth: true }, async ({ user, params }) => {
    await assertDeploymentOwned(params.deploymentId, user.organizationId)
    return rollbackDeployment(params.deploymentId, user.id)
  })
