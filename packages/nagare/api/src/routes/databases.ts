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
  startDatabase,
  stopDatabase,
  updateDatabase,
  updateDatabaseCanvasPosition,
} from '@mizu/nagare-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

export const databasesRoutes = new Elysia({ name: 'databases', prefix: '/databases' })
  .use(authPlugin)
  // (｡◕‿◕｡) databases in a project (project must belong to the team)
  .get('/', { auth: true, query: DatabaseListQuerySchema }, async ({ user, query }) => {
    await assertProjectOwned(query.projectId, user.organizationId)
    return listDatabases(query.projectId)
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
  // ✨(っ◔◡◔)っ a new database (in a project the team owns)
  .post('/', { auth: true, body: CreateDatabaseSchema }, async ({ user, body }) => {
    await assertProjectOwned(body.projectId, user.organizationId)
    return createDatabase(body)
  })
  // (๑˃ᴗ˂)ﻭ tweak a database
  .patch(
    '/:databaseId',
    { auth: true, body: UpdateDatabaseSchema },
    async ({ user, params, body }) => {
      await assertDatabaseOwned(params.databaseId, user.organizationId)
      return updateDatabase(params.databaseId, body)
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
    await assertDatabaseOwned(params.databaseId, user.organizationId)
    return deleteDatabase(params.databaseId)
  })
  // 🚀 provision + start
  .post('/:databaseId/deploy', { auth: true }, async ({ user, params }) => {
    await assertDatabaseOwned(params.databaseId, user.organizationId)
    return deployDatabase(params.databaseId)
  })
  // ▶ start the container
  .post('/:databaseId/start', { auth: true }, async ({ user, params }) => {
    await assertDatabaseOwned(params.databaseId, user.organizationId)
    return startDatabase(params.databaseId)
  })
  // ⏹ stop the container
  .post('/:databaseId/stop', { auth: true }, async ({ user, params }) => {
    await assertDatabaseOwned(params.databaseId, user.organizationId)
    return stopDatabase(params.databaseId)
  })
