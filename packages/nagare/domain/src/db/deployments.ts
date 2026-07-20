import { relations } from 'drizzle-orm'
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { environmentTable } from './environments'
import { jsonb } from './lib/jsonb'
import { projectTable } from './projects'
import { serviceTable } from './services'

/**
 * 🚀 Deployments Table 🚀
 * Every deployService run leaves a record — a snapshot of what shipped, so a
 * service can roll back to any previous deploy.
 *
 *      ___
 *     / _ \    liftoff history,
 *    | / \ |   one row per launch
 *    |_\_/_|
 *     |___|
 *    /_____\
 */
export const deploymentTable = pgTable(
  'deployment',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => serviceTable.id, { onDelete: 'cascade' }),
    // Denormalized for project-scoped queries without a join chain.
    projectId: uuid('project_id')
      .notNull()
      .references(() => projectTable.id, { onDelete: 'cascade' }),
    environmentId: uuid('environment_id')
      .notNull()
      .references(() => environmentTable.id, { onDelete: 'cascade' }),
    status: text('status', { enum: ['success', 'error'] }).notNull(),
    error: text('error'),
    // Snapshot of service.sourceConfig at deploy time — what rollback restores.
    sourceConfig: jsonb('source_config').notNull(),
    // The service's ENCRYPTED envVars string at deploy time (same ciphertext
    // format as service.env_vars) — never stored in plaintext.
    envVarsSnapshot: text('env_vars_snapshot'),
    trigger: text('trigger', { enum: ['user', 'supervisor', 'rollback'] })
      .default('user')
      .notNull(),
    // JWT sub of the initiating user; null for supervisor heals. Plain column,
    // no cross-domain FK (nagare trusts the JWT).
    triggeredBy: text('triggered_by'),
    containerId: text('container_id'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index('deployment_serviceId_createdAt_idx').on(table.serviceId, table.createdAt),
    index('deployment_projectId_idx').on(table.projectId),
  ],
)

/**
 * ^._.^ Deployment Relations ^._.^
 */
export const deploymentRelations = relations(deploymentTable, ({ one }) => ({
  service: one(serviceTable, {
    fields: [deploymentTable.serviceId],
    references: [serviceTable.id],
  }),
  project: one(projectTable, {
    fields: [deploymentTable.projectId],
    references: [projectTable.id],
  }),
}))
