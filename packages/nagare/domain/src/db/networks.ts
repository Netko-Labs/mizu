import { relations } from 'drizzle-orm'
import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { jsonb } from './lib/jsonb'
import { projectTable } from './projects'

/**
 * ≽^•⩊•^≼ Networks Table ≽^•⩊•^≼
 * Docker networks where services swim together
 *
 *     ~^~^~^~^~
 *    /  o   o  \
 *   |  ><((°>   |  "connections flow like water"
 *   |   <°))><  |
 *    \  ><((°> /
 *     ~^~^~^~^~
 */

export const networkTable = pgTable(
  'network',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projectTable.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    subnet: text('subnet'),
    gateway: text('gateway'),
    internal: boolean('internal').default(false).notNull(),
    networkId: text('network_id'),
    canvasPosition: jsonb('canvas_position').default({ x: 0, y: 0 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('network_projectId_idx').on(table.projectId)],
)

/**
 * ฅ^•ﻌ•^ฅ Network Relations ฅ^•ﻌ•^ฅ
 * Networks belong to projects and connect services
 */
export const networkRelations = relations(networkTable, ({ one }) => ({
  project: one(projectTable, {
    fields: [networkTable.projectId],
    references: [projectTable.id],
  }),
}))
