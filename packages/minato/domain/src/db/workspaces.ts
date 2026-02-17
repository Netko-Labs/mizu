import { relations } from 'drizzle-orm'
import { index, jsonb, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { user } from './auth'

/**
 * ≽^•⩊•^≼ Workspaces Table ≽^•⩊•^≼
 * Where projects gather like cats in a sunbeam
 *
 *    /\_____/\
 *   /  o   o  \    "~/.mizu/{workspace-slug}/"
 *  ( ==  ^  == )
 *   )         (
 *  (  workspace )
 * ( (  )   (  ) )
 * (__(__)___(__)__)
 */
export const workspaceTable = pgTable(
  'workspace',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    settings: jsonb('settings').default({}).notNull(),
    createdAt: timestamp('created_at')
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp('updated_at')
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique('workspace_userId_slug_unique').on(table.userId, table.slug),
    index('workspace_userId_idx').on(table.userId),
  ],
)

/**
 * ฅ^•ﻌ•^ฅ Workspace Relations ฅ^•ﻌ•^ฅ
 * Workspaces belong to users, projects flow into workspaces
 */
export const workspaceRelations = relations(workspaceTable, ({ one }) => ({
  user: one(user, {
    fields: [workspaceTable.userId],
    references: [user.id],
  }),
}))
