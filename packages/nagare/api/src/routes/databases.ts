import {
  CreateDatabaseSchema,
  DatabaseListQuerySchema,
  PositionSchema,
  UpdateDatabaseSchema,
} from '@mizu/nagare-domain'
import {
  assertDatabaseOwned,
  assertProjectOwned,
  createDatabase,
  deleteDatabase,
  deployDatabase,
  getDatabase,
  getDatabaseConnectionInfo,
  getDatabaseStatus,
  listDatabases,
  resolveEnvironmentId,
  startDatabase,
  stopDatabase,
  updateDatabase,
  updateDatabaseCanvasPosition,
} from '@mizu/nagare-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'
import { logDatabaseActivity } from '../shared/activity'

export const databasesRoutes = new Elysia({ name: 'databases', prefix: '/databases' })
  .use(authPlugin)
  // (｡◕‿◕｡) databases in a project (project must belong to the team), optionally
  // scoped to one environment
  .get('/', { auth: true, query: DatabaseListQuerySchema }, async ({ user, query }) => {
    await assertProjectOwned(query.projectId, user.organizationId)
    return listDatabases(query.projectId, query.environmentId)
  })
  // (・o・)ゞ one database
  .get('/:databaseId', { auth: true }, async ({ user, params }) => {
    await assertDatabaseOwned(params.databaseId, user.organizationId)
    return getDatabase(params.databaseId)
  })
  // (⌐■_■) container status
  .get('/:databaseId/status', { auth: true }, async ({ user, params }) => {
    await assertDatabaseOwned(params.databaseId, user.organizationId)
    return getDatabaseStatus(params.databaseId)
  })
  // 🔑 connection string + credentials (guard hard — this decrypts secrets)
  .get('/:databaseId/connection-info', { auth: true }, async ({ user, params }) => {
    await assertDatabaseOwned(params.databaseId, user.organizationId)
    return getDatabaseConnectionInfo(params.databaseId)
  })
  // ✨(っ◔◡◔)っ a new database (in a project the team owns, in the given
  // environment or the project's default)
  .post('/', { auth: true, body: CreateDatabaseSchema }, async ({ user, body }) => {
    await assertProjectOwned(body.projectId, user.organizationId)
    const environmentId = await resolveEnvironmentId(body.projectId, body.environmentId)
    const created = await createDatabase({
      projectId: body.projectId,
      environmentId,
      type: body.type,
      name: body.name,
      version: body.version,
    })
    if (created) logDatabaseActivity(created, user, 'database.create')
    return created
  })
  // (๑˃ᴗ˂)ﻭ tweak a database
  .patch(
    '/:databaseId',
    { auth: true, body: UpdateDatabaseSchema },
    async ({ user, params, body }) => {
      const database = await assertDatabaseOwned(params.databaseId, user.organizationId)
      const result = await updateDatabase(params.databaseId, body)
      logDatabaseActivity(database, user, 'database.update', { fields: Object.keys(body) })
      return result
    },
  )
  // ⇢ nudge the node on the canvas
  .patch(
    '/:databaseId/position',
    { auth: true, body: PositionSchema },
    async ({ user, params, body }) => {
      await assertDatabaseOwned(params.databaseId, user.organizationId)
      return updateDatabaseCanvasPosition(params.databaseId, body.position)
    },
  )
  // (ノ﹏ヽ) delete a database
  .delete('/:databaseId', { auth: true }, async ({ user, params }) => {
    const database = await assertDatabaseOwned(params.databaseId, user.organizationId)
    const result = await deleteDatabase(params.databaseId)
    logDatabaseActivity(database, user, 'database.delete')
    return result
  })
  // 🚀 provision + start
  .post('/:databaseId/deploy', { auth: true }, async ({ user, params }) => {
    const database = await assertDatabaseOwned(params.databaseId, user.organizationId)
    logDatabaseActivity(database, user, 'database.deploy')
    return deployDatabase(params.databaseId)
  })
  // ▶ start the container
  .post('/:databaseId/start', { auth: true }, async ({ user, params }) => {
    const database = await assertDatabaseOwned(params.databaseId, user.organizationId)
    logDatabaseActivity(database, user, 'database.start')
    return startDatabase(params.databaseId)
  })
  // ⏹ stop the container
  .post('/:databaseId/stop', { auth: true }, async ({ user, params }) => {
    const database = await assertDatabaseOwned(params.databaseId, user.organizationId)
    logDatabaseActivity(database, user, 'database.stop')
    return stopDatabase(params.databaseId)
  })
