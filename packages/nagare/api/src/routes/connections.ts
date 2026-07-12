import { CreateConnectionSchema } from '@mizu/nagare-domain'
import {
  assertConnectionOwned,
  assertDatabaseOwned,
  assertProjectOwned,
  assertServiceOwned,
  createConnection,
  deleteConnection,
  listConnectionsForProject,
  listConnectionsForService,
} from '@mizu/nagare-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

export const connectionsRoutes = new Elysia({ name: 'connections', prefix: '/connections' })
  .use(authPlugin)
  // (｡◕‿◕｡) connections hanging off one service
  .get('/for-service/:serviceId', { auth: true }, async ({ user, params }) => {
    await assertServiceOwned(params.serviceId, user.organizationId)
    return listConnectionsForService(params.serviceId)
  })
  // (｡◕‿◕｡) every connection in a project
  .get('/for-project/:projectId', { auth: true }, async ({ user, params }) => {
    await assertProjectOwned(params.projectId, user.organizationId)
    return listConnectionsForProject(params.projectId)
  })
  // ✨(っ◔◡◔)っ wire two nodes together — BOTH endpoints must be the team's,
  // else a user could wire their service to a victim's database and read its
  // injected credentials.
  .post('/', { auth: true, body: CreateConnectionSchema }, async ({ user, body }) => {
    await assertServiceOwned(body.fromServiceId, user.organizationId)
    if (body.toDatabaseId) await assertDatabaseOwned(body.toDatabaseId, user.organizationId)
    if (body.toServiceId) await assertServiceOwned(body.toServiceId, user.organizationId)
    return createConnection(body)
  })
  // (ノ﹏ヽ) snip a connection
  .delete('/:connectionId', { auth: true }, async ({ user, params }) => {
    await assertConnectionOwned(params.connectionId, user.organizationId)
    return deleteConnection(params.connectionId)
  })
