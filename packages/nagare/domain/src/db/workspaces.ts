import { index, jsonb, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'

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
    // Auth tables live in minato's database domain — no cross-domain FK; nagare
    // trusts the JWT sub claim as userId.
    userId: text('user_id').notNull(),
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
