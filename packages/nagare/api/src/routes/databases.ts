import {
  CreateDatabaseSchema,
  DatabaseListQuerySchema,
  PositionSchema,
  UpdateDatabaseSchema,
} from '@mizu/nagare-domain'
import {
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
  // (｡◕‿◕｡) databases in a project
  .get('/', { auth: true, query: DatabaseListQuerySchema }, ({ query }) =>
    listDatabases(query.projectId),
  )
  // (・o・)ゞ one database
  .get('/:databaseId', { auth: true }, ({ params }) => getDatabase(params.databaseId))
  // (⌐■_■) container status
  .get('/:databaseId/status', { auth: true }, ({ params }) => getDatabaseStatus(params.databaseId))
  // 🔑 connection string + credentials
  .get('/:databaseId/connection-info', { auth: true }, ({ params }) =>
    getDatabaseConnectionInfo(params.databaseId),
  )
  // ✨(っ◔◡◔)っ a new database
  .post('/', { auth: true, body: CreateDatabaseSchema }, ({ body }) => createDatabase(body))
  // (๑˃ᴗ˂)ﻭ tweak a database
  .patch('/:databaseId', { auth: true, body: UpdateDatabaseSchema }, ({ params, body }) =>
    updateDatabase(params.databaseId, body),
  )
  // ⇢ nudge the node on the canvas
  .patch('/:databaseId/position', { auth: true, body: PositionSchema }, ({ params, body }) =>
    updateDatabaseCanvasPosition(params.databaseId, body.position),
  )
  // (ノ﹏ヽ) delete a database
  .delete('/:databaseId', { auth: true }, ({ params }) => deleteDatabase(params.databaseId))
  // 🚀 provision + start
  .post('/:databaseId/deploy', { auth: true }, ({ params }) => deployDatabase(params.databaseId))
  // ▶ start the container
  .post('/:databaseId/start', { auth: true }, ({ params }) => startDatabase(params.databaseId))
  // ⏹ stop the container
  .post('/:databaseId/stop', { auth: true }, ({ params }) => stopDatabase(params.databaseId))
