import { relations } from 'drizzle-orm'
import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { jsonb } from './lib/jsonb'
import { projectTable } from './projects'

/**
 * ≽^•⩊•^≼ External Services Table ≽^•⩊•^≼
 * Third-party APIs, databases, and storage outside your pond
 *
 *       ☁️
 *    /\_____/\     ☁️
 *   /  o   o  \
 *  ( ==  ^  == )  "external fish~"
 *   )   🌐    (     ☁️
 *  (  outside  )
 * ( (  pond  ) )
 * (__(__)___(__)__)
 */

export const externalServiceTypeEnum = [
  'api',
  'database',
  'storage',
  'cdn',
  'auth',
  'messaging',
  'other',
] as const
export type ExternalServiceType = (typeof externalServiceTypeEnum)[number]

export const externalServiceProtocolEnum = ['http', 'https', 'tcp', 'grpc', 'ws', 'wss'] as const
export type ExternalServiceProtocol = (typeof externalServiceProtocolEnum)[number]

export const externalServiceTable = pgTable(
  'external_service',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projectTable.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    type: text('type', { enum: externalServiceTypeEnum }).notNull(),
    host: text('host').notNull(),
    port: integer('port'),
    protocol: text('protocol', { enum: externalServiceProtocolEnum }).default('https').notNull(),
    credentials: text('credentials'), // Encrypted JSON string
    healthEndpoint: text('health_endpoint'),
    canvasPosition: jsonb('canvas_position').default({ x: 0, y: 0 }).notNull(),
    createdAt: timestamp('created_at')
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp('updated_at')
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('external_service_projectId_idx').on(table.projectId)],
)

/**
 * ฅ^•ﻌ•^ฅ External Service Relations ฅ^•ﻌ•^ฅ
 * External services belong to projects
 */
export const externalServiceRelations = relations(externalServiceTable, ({ one }) => ({
  project: one(projectTable, {
    fields: [externalServiceTable.projectId],
    references: [projectTable.id],
  }),
}))
