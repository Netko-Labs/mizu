import { relations } from 'drizzle-orm'
import { boolean, index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
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

export const networkDriverEnum = ['bridge', 'host', 'overlay', 'macvlan', 'none'] as const
export type NetworkDriver = (typeof networkDriverEnum)[number]

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
    driver: text('driver', { enum: networkDriverEnum }).default('bridge').notNull(),
    subnet: text('subnet'),
    gateway: text('gateway'),
    internal: boolean('internal').default(false).notNull(),
    dockerNetworkId: text('docker_network_id'),
    canvasPosition: jsonb('canvas_position').default({ x: 0, y: 0 }).notNull(),
    createdAt: timestamp('created_at')
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp('updated_at')
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
