import { relations } from 'drizzle-orm'
import { index, jsonb, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { workspaceTable } from './workspaces'

/**
 * ≽^•⩊•^≼ Projects Table ≽^•⩊•^≼
 * Where your deployments find their forever home
 *
 *    /\_____/\
 *   /  o   o  \
 *  ( ==  ^  == )
 *   )         (
 *  (           )
 * ( (  )   (  ) )
 * (__(__)___(__)__)
 */
export const projectTable = pgTable(
  'project',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    // No cross-domain FK to minato's auth tables; nagare trusts the JWT sub claim.
    userId: text('user_id').notNull(),
    workspaceId: uuid('workspace_id').references(() => workspaceTable.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    settings: jsonb('settings').default({}).notNull(),
    dockerNetworkId: text('docker_network_id'),
    createdAt: timestamp('created_at')
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp('updated_at')
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('project_userId_idx').on(table.userId),
    index('project_workspaceId_idx').on(table.workspaceId),
    unique('project_workspaceId_slug_unique').on(table.workspaceId, table.slug),
  ],
)

/**
 * ฅ^•ﻌ•^ฅ Project Relations ฅ^•ﻌ•^ฅ
 * Projects belong to users and workspaces, services belong to projects
 * Note: services relation is defined in services.ts to avoid circular imports
 */
export const projectRelations = relations(projectTable, ({ one }) => ({
  workspace: one(workspaceTable, {
    fields: [projectTable.workspaceId],
    references: [workspaceTable.id],
  }),
  // services: many(serviceTable) - defined in services.ts for modularity
}))
