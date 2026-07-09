import {
  CreateServiceSchema,
  PositionSchema,
  ServiceListQuerySchema,
  UpdateServiceSchema,
} from '@mizu/nagare-domain'
import {
  createService,
  deleteService,
  deployService,
  getService,
  getServiceStatus,
  listServices,
  restartService,
  startService,
  stopService,
  updateCanvasPosition,
  updateService,
} from '@mizu/nagare-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

export const servicesRoutes = new Elysia({ name: 'services', prefix: '/services' })
  .use(authPlugin)
  // (｡◕‿◕｡) services in a project
  .get('/', { auth: true, query: ServiceListQuerySchema }, ({ query }) =>
    listServices(query.projectId),
  )
  // (・o・)ゞ one service
  .get('/:serviceId', { auth: true }, ({ params }) => getService(params.serviceId))
  // (⌐■_■) container status
  .get('/:serviceId/status', { auth: true }, ({ params }) => getServiceStatus(params.serviceId))
  // ✨(っ◔◡◔)っ a new service
  .post('/', { auth: true, body: CreateServiceSchema }, ({ body }) =>
    createService({
      projectId: body.projectId,
      name: body.name,
      sourceType: body.sourceType,
      sourceConfig: body.sourceConfig,
      ports: body.ports,
    }),
  )
  // (๑˃ᴗ˂)ﻭ tweak a service
  .patch('/:serviceId', { auth: true, body: UpdateServiceSchema }, ({ params, body }) =>
    updateService(params.serviceId, body),
  )
  // ⇢ nudge the node on the canvas
  .patch('/:serviceId/position', { auth: true, body: PositionSchema }, ({ params, body }) =>
    updateCanvasPosition(params.serviceId, body.position),
  )
  // (ノ﹏ヽ) delete a service
  .delete('/:serviceId', { auth: true }, ({ params }) => deleteService(params.serviceId))
  // 🚀 ship it
  .post('/:serviceId/deploy', { auth: true }, ({ params }) => deployService(params.serviceId))
  // ▶ start the container
  .post('/:serviceId/start', { auth: true }, ({ params }) => startService(params.serviceId))
  // ⏹ stop the container
  .post('/:serviceId/stop', { auth: true }, ({ params }) => stopService(params.serviceId))
  // 🔄 restart the container
  .post('/:serviceId/restart', { auth: true }, ({ params }) => restartService(params.serviceId))
