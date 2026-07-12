import {
  CreateServiceSchema,
  PositionSchema,
  ServiceListQuerySchema,
  UpdateServiceSchema,
} from '@mizu/nagare-domain'
import {
  assertProjectOwned,
  assertServiceOwned,
  createService,
  deleteService,
  deployService,
  getService,
  getServiceStatus,
  listServices,
  resolveEnvironmentId,
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
  // (｡◕‿◕｡) services in a project (project must belong to the team), optionally
  // scoped to one environment
  .get('/', { auth: true, query: ServiceListQuerySchema }, async ({ user, query }) => {
    await assertProjectOwned(query.projectId, user.organizationId)
    return listServices(query.projectId, query.environmentId)
  })
  // (・o・)ゞ one service
  .get('/:serviceId', { auth: true }, async ({ user, params }) => {
    await assertServiceOwned(params.serviceId, user.organizationId)
    return getService(params.serviceId)
  })
  // (⌐■_■) container status
  .get('/:serviceId/status', { auth: true }, async ({ user, params }) => {
    await assertServiceOwned(params.serviceId, user.organizationId)
    return getServiceStatus(params.serviceId)
  })
  // ✨(っ◔◡◔)っ a new service (in a project the team owns, in the given
  // environment or the project's default)
  .post('/', { auth: true, body: CreateServiceSchema }, async ({ user, body }) => {
    await assertProjectOwned(body.projectId, user.organizationId)
    const environmentId = await resolveEnvironmentId(body.projectId, body.environmentId)
    return createService({
      projectId: body.projectId,
      environmentId,
      name: body.name,
      sourceType: body.sourceType,
      sourceConfig: body.sourceConfig,
      ports: body.ports,
    })
  })
  // (๑˃ᴗ˂)ﻭ tweak a service
  .patch(
    '/:serviceId',
    { auth: true, body: UpdateServiceSchema },
    async ({ user, params, body }) => {
      await assertServiceOwned(params.serviceId, user.organizationId)
      return updateService(params.serviceId, body)
    },
  )
  // ⇢ nudge the node on the canvas
  .patch(
    '/:serviceId/position',
    { auth: true, body: PositionSchema },
    async ({ user, params, body }) => {
      await assertServiceOwned(params.serviceId, user.organizationId)
      return updateCanvasPosition(params.serviceId, body.position)
    },
  )
  // (ノ﹏ヽ) delete a service
  .delete('/:serviceId', { auth: true }, async ({ user, params }) => {
    await assertServiceOwned(params.serviceId, user.organizationId)
    return deleteService(params.serviceId)
  })
  // 🚀 ship it
  .post('/:serviceId/deploy', { auth: true }, async ({ user, params }) => {
    await assertServiceOwned(params.serviceId, user.organizationId)
    return deployService(params.serviceId)
  })
  // ▶ start the container
  .post('/:serviceId/start', { auth: true }, async ({ user, params }) => {
    await assertServiceOwned(params.serviceId, user.organizationId)
    return startService(params.serviceId)
  })
  // ⏹ stop the container
  .post('/:serviceId/stop', { auth: true }, async ({ user, params }) => {
    await assertServiceOwned(params.serviceId, user.organizationId)
    return stopService(params.serviceId)
  })
  // 🔄 restart the container
  .post('/:serviceId/restart', { auth: true }, async ({ user, params }) => {
    await assertServiceOwned(params.serviceId, user.organizationId)
    return restartService(params.serviceId)
  })
