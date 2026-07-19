import { index, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { jsonb } from './lib/jsonb'

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
    // The owning team (better-auth organization.id). No cross-domain FK —
    // nagare trusts the JWT's activeOrganizationId claim.
    organizationId: text('organization_id').notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    settings: jsonb('settings').default({}).notNull(),
    networkId: text('network_id'),
    createdAt: timestamp('created_at')
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp('updated_at')
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('project_organizationId_idx').on(table.organizationId),
    unique('project_organizationId_slug_unique').on(table.organizationId, table.slug),
  ],
)
