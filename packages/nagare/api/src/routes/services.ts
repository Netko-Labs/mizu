import {
  CreateServiceSchema,
  ExecCommandSchema,
  PositionSchema,
  ServiceFileQuerySchema,
  ServiceListQuerySchema,
  UpdateEnvVarsSchema,
  UpdateServiceSchema,
  WriteServiceFileSchema,
} from '@mizu/nagare-domain'
import {
  assertProjectOwned,
  assertServiceOwned,
  createService,
  deleteService,
  deployService,
  execInService,
  getService,
  getServiceEnvVars,
  getServiceMetrics,
  getServiceStatus,
  listServiceFiles,
  listServices,
  readServiceFile,
  resolveEnvironmentId,
  restartService,
  startService,
  stopService,
  updateCanvasPosition,
  updateService,
  updateServiceEnvVars,
  writeServiceFile,
} from '@mizu/nagare-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'
import { logServiceActivity } from '../shared/activity'

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
  // 📈 ~1h CPU/mem window from the in-memory sampler
  .get('/:serviceId/metrics', { auth: true }, async ({ user, params }) => {
    await assertServiceOwned(params.serviceId, user.organizationId)
    return getServiceMetrics(params.serviceId)
  })
  // ✨(っ◔◡◔)っ a new service (in a project the team owns, in the given
  // environment or the project's default)
  .post('/', { auth: true, body: CreateServiceSchema }, async ({ user, body }) => {
    await assertProjectOwned(body.projectId, user.organizationId)
    const environmentId = await resolveEnvironmentId(body.projectId, body.environmentId)
    const created = await createService({
      projectId: body.projectId,
      environmentId,
      name: body.name,
      sourceType: body.sourceType,
      sourceConfig: body.sourceConfig,
      ports: body.ports,
    })
    if (created) logServiceActivity(created, user, 'service.create')
    return created
  })
  // 🔐 the service's user env vars, decrypted (owner-scoped — same precedent
  // as database connection-info)
  .get('/:serviceId/env-vars', { auth: true }, async ({ user, params }) => {
    await assertServiceOwned(params.serviceId, user.organizationId)
    return getServiceEnvVars(params.serviceId)
  })
  // 🔐 full-replace the user env vars (applied on next deploy)
  .put(
    '/:serviceId/env-vars',
    { auth: true, body: UpdateEnvVarsSchema },
    async ({ user, params, body }) => {
      const service = await assertServiceOwned(params.serviceId, user.organizationId)
      const result = await updateServiceEnvVars(params.serviceId, body)
      logServiceActivity(service, user, 'service.env-update', {
        varsChanged: Object.keys(body).length,
      })
      return result
    },
  )
  // 🖥 one-shot console command inside the running container
  .post(
    '/:serviceId/exec',
    { auth: true, body: ExecCommandSchema },
    async ({ user, params, body }) => {
      const service = await assertServiceOwned(params.serviceId, user.organizationId)
      logServiceActivity(service, user, 'service.exec', { command: body.command.slice(0, 120) })
      return execInService(params.serviceId, body.command)
    },
  )
  // 📁 browse the service's host file area (config files + persistent volumes)
  .get(
    '/:serviceId/files',
    { auth: true, query: ServiceFileQuerySchema },
    async ({ user, params, query }) => {
      await assertServiceOwned(params.serviceId, user.organizationId)
      return listServiceFiles(params.serviceId, query.path)
    },
  )
  // 📄 read a file for the in-drawer editor
  .get(
    '/:serviceId/files/content',
    { auth: true, query: ServiceFileQuerySchema },
    async ({ user, params, query }) => {
      await assertServiceOwned(params.serviceId, user.organizationId)
      return readServiceFile(params.serviceId, query.path)
    },
  )
  // ✏️ write a file (bind-mounted paths reflect in the container immediately)
  .put(
    '/:serviceId/files/content',
    { auth: true, body: WriteServiceFileSchema },
    async ({ user, params, body }) => {
      const service = await assertServiceOwned(params.serviceId, user.organizationId)
      const result = await writeServiceFile(params.serviceId, body.path, body.content)
      logServiceActivity(service, user, 'service.file-edit', { path: result.path })
      return result
    },
  )
  // (๑˃ᴗ˂)ﻭ tweak a service
  .patch(
    '/:serviceId',
    { auth: true, body: UpdateServiceSchema },
    async ({ user, params, body }) => {
      const service = await assertServiceOwned(params.serviceId, user.organizationId)
      const result = await updateService(params.serviceId, body)
      logServiceActivity(service, user, 'service.update', { fields: Object.keys(body) })
      return result
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
    const service = await assertServiceOwned(params.serviceId, user.organizationId)
    const result = await deleteService(params.serviceId)
    logServiceActivity(service, user, 'service.delete')
    return result
  })
  // 🚀 ship it
  .post('/:serviceId/deploy', { auth: true }, async ({ user, params }) => {
    const service = await assertServiceOwned(params.serviceId, user.organizationId)
    logServiceActivity(service, user, 'service.deploy')
    return deployService(params.serviceId, { trigger: 'user', userId: user.id })
  })
  // ▶ start the container
  .post('/:serviceId/start', { auth: true }, async ({ user, params }) => {
    const service = await assertServiceOwned(params.serviceId, user.organizationId)
    logServiceActivity(service, user, 'service.start')
    return startService(params.serviceId)
  })
  // ⏹ stop the container
  .post('/:serviceId/stop', { auth: true }, async ({ user, params }) => {
    const service = await assertServiceOwned(params.serviceId, user.organizationId)
    logServiceActivity(service, user, 'service.stop')
    return stopService(params.serviceId)
  })
  // 🔄 restart the container
  .post('/:serviceId/restart', { auth: true }, async ({ user, params }) => {
    const service = await assertServiceOwned(params.serviceId, user.organizationId)
    logServiceActivity(service, user, 'service.restart')
    return restartService(params.serviceId)
  })
