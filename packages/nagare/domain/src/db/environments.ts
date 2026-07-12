import { relations } from 'drizzle-orm'
import { boolean, index, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { projectTable } from './projects'

/**
 * ≽^•⩊•^≼ Environments Table ≽^•⩊•^≼
 * A project's parallel worlds — production, staging, dev — each an isolated
 * graph of services & databases with its own ingress hosts and container
 * network. Every project has exactly one default environment.
 *
 *    /\_/\   prod
 *   ( o.o )  staging
 *    > ^ <   dev
 */
export const environmentTable = pgTable(
  'environment',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projectTable.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at')
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp('updated_at')
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('environment_projectId_idx').on(table.projectId),
    unique('environment_projectId_slug_unique').on(table.projectId, table.slug),
  ],
)

/**
 * ฅ^•ﻌ•^ฅ Environment Relations ฅ^•ﻌ•^ฅ
 * An environment belongs to a project. (The reverse service/database links are
 * declared on those tables to keep this module's imports a clean DAG.)
 */
export const environmentRelations = relations(environmentTable, ({ one }) => ({
  project: one(projectTable, {
    fields: [environmentTable.projectId],
    references: [projectTable.id],
  }),
}))
