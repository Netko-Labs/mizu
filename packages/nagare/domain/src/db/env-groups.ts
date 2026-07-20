import { relations } from 'drizzle-orm'
import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { jsonb } from './lib/jsonb'
import { projectTable } from './projects'
import { serviceTable } from './services'

/**
 * ≽^•⩊•^≼ Environment Groups Table ≽^•⩊•^≼
 * Shared secrets and configs that flow between services
 *
 *    🔐 ≽^•⩊•^≼ 🔐
 *   /  env vars  \
 *  ( API_KEY=***  )
 *   \ DB_URL=***  /
 *    (secrets~meow)
 */
export const envGroupTable = pgTable(
  'env_group',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projectTable.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    values: text('values'), // Encrypted JSON string of key-value pairs
    isSecret: boolean('is_secret').default(false).notNull(),
    canvasPosition: jsonb('canvas_position').default({ x: 0, y: 0 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('env_group_projectId_idx').on(table.projectId)],
)

/**
 * ฅ^•ﻌ•^ฅ Env Group Relations ฅ^•ﻌ•^ฅ
 * Env groups belong to projects and are linked to services
 */
export const envGroupRelations = relations(envGroupTable, ({ one, many }) => ({
  project: one(projectTable, {
    fields: [envGroupTable.projectId],
    references: [projectTable.id],
  }),
  serviceLinks: many(serviceEnvGroupTable),
}))

/**
 * ≽^•⩊•^≼ Service-EnvGroup Link Table ≽^•⩊•^≼
 * Many-to-many: services can use multiple env groups
 */
export const serviceEnvGroupTable = pgTable(
  'service_env_group',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => serviceTable.id, { onDelete: 'cascade' }),
    envGroupId: uuid('env_group_id')
      .notNull()
      .references(() => envGroupTable.id, { onDelete: 'cascade' }),
    prefix: text('prefix'), // Optional prefix for env var names
    createdAt: timestamp('created_at', { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index('service_env_group_serviceId_idx').on(table.serviceId),
    index('service_env_group_envGroupId_idx').on(table.envGroupId),
  ],
)

/**
 * ฅ^•ﻌ•^ฅ Service-EnvGroup Relations ฅ^•ﻌ•^ฅ
 */
export const serviceEnvGroupRelations = relations(serviceEnvGroupTable, ({ one }) => ({
  service: one(serviceTable, {
    fields: [serviceEnvGroupTable.serviceId],
    references: [serviceTable.id],
  }),
  envGroup: one(envGroupTable, {
    fields: [serviceEnvGroupTable.envGroupId],
    references: [envGroupTable.id],
  }),
}))
