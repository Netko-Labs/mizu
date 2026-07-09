import { CreateConnectionSchema } from '@mizu/nagare-domain'
import {
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
  .get('/for-service/:serviceId', { auth: true }, ({ params }) =>
    listConnectionsForService(params.serviceId),
  )
  // (｡◕‿◕｡) every connection in a project
  .get('/for-project/:projectId', { auth: true }, ({ params }) =>
    listConnectionsForProject(params.projectId),
  )
  // ✨(っ◔◡◔)っ wire two nodes together
  .post('/', { auth: true, body: CreateConnectionSchema }, ({ body }) => createConnection(body))
  // (ノ﹏ヽ) snip a connection
  .delete('/:connectionId', { auth: true }, ({ params }) => deleteConnection(params.connectionId))
