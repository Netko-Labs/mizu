import {
  CreateEnvironmentSchema,
  EnvironmentListQuerySchema,
  UpdateEnvironmentSchema,
} from '@mizu/nagare-domain'
import {
  assertEnvironmentOwned,
  assertProjectOwned,
  createEnvironment,
  deleteEnvironment,
  listEnvironments,
  renameEnvironment,
} from '@mizu/nagare-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

export const environmentsRoutes = new Elysia({ name: 'environments', prefix: '/environments' })
  .use(authPlugin)
  // (｡◕‿◕｡) a project's environments (project must belong to the team)
  .get('/', { auth: true, query: EnvironmentListQuerySchema }, async ({ user, query }) => {
    await assertProjectOwned(query.projectId, user.organizationId)
    return listEnvironments(query.projectId)
  })
  // ✨(っ◔◡◔)っ a new environment in a project the team owns
  .post('/', { auth: true, body: CreateEnvironmentSchema }, async ({ user, body }) => {
    await assertProjectOwned(body.projectId, user.organizationId)
    return createEnvironment({ projectId: body.projectId, name: body.name })
  })
  // (๑˃ᴗ˂)ﻭ rename an environment
  .patch(
    '/:environmentId',
    { auth: true, body: UpdateEnvironmentSchema },
    async ({ user, params, body }) => {
      await assertEnvironmentOwned(params.environmentId, user.organizationId)
      return renameEnvironment(params.environmentId, body.name)
    },
  )
  // (ノ﹏ヽ) tear down an environment + everything in it (default env is protected)
  .delete('/:environmentId', { auth: true }, async ({ user, params }) => {
    await assertEnvironmentOwned(params.environmentId, user.organizationId)
    await deleteEnvironment(params.environmentId)
    return { success: true }
  })
