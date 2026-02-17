import { relations } from 'drizzle-orm'
import { index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { projectTable } from './projects'

/**
 * ╭──────────────────────────────────────╮
 * │  🐱 Databases Table 🐱              │
 * │  Where data goes to take a catnap   │
 * ╰──────────────────────────────────────╯
 *       /\_____/\
 *      /  o   o  \
 *     ( ==  ^  == )
 *      )         (
 *     (           )
 *    ( (  )   (  ) )
 *   (__(__)___(__)__)
 */

export const databaseTypeEnum = ['postgres', 'mysql', 'redis', 'mongodb', 'mariadb'] as const
export type DatabaseType = (typeof databaseTypeEnum)[number]

export const databaseStatusEnum = [
  'created',
  'starting',
  'running',
  'stopping',
  'stopped',
  'error',
] as const
export type DatabaseStatus = (typeof databaseStatusEnum)[number]

export const databaseTable = pgTable(
  'database',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projectTable.id, { onDelete: 'cascade' }),
    type: text('type', { enum: databaseTypeEnum }).notNull(),
    name: text('name').notNull(),
    version: text('version'),
    credentials: text('credentials'),
    port: integer('port'),
    status: text('status', { enum: databaseStatusEnum }).default('created').notNull(),
    containerId: text('container_id'),
    canvasPosition: jsonb('canvas_position')
      .$type<{ x: number; y: number }>()
      .default({ x: 0, y: 0 })
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('database_projectId_idx').on(table.projectId)],
)

/**
 * ฅ^•ﻌ•^ฅ Database Relations ฅ^•ﻌ•^ฅ
 * Every database belongs to a project, like a kitten to its family
 */
export const databaseTableRelations = relations(databaseTable, ({ one }) => ({
  project: one(projectTable, {
    fields: [databaseTable.projectId],
    references: [projectTable.id],
  }),
}))
