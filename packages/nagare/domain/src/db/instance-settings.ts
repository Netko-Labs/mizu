import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

/**
 * ≽^•⩊•^≼ Instance Settings Table ≽^•⩊•^≼
 * Global configuration for the Mizu instance — single-row table
 *
 *   ~水~  "mizu config --global"
 */
export const instanceSettingTable = pgTable('instance_setting', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  instanceName: text('instance_name').notNull().default('mizu'),
  domain: text('domain'),
  dns: text('dns'),
  timezone: text('timezone').notNull().default('UTC'),
  publicIpv4: text('public_ipv4'),
  publicIpv6: text('public_ipv6'),
  doNotTrack: boolean('do_not_track').notNull().default(false),
  registrationEnabled: boolean('registration_enabled').notNull().default(true),
  updatesCronExpression: text('updates_cron_expression').notNull().default('0 3 * * *'),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})
