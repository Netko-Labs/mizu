import { relations } from 'drizzle-orm'
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { environmentTable } from './environments'
import { jsonb } from './lib/jsonb'
import { projectTable } from './projects'

/**
 * (=^･ω･^=) Services Table (=^･ω･^=)
 * Containers, apps, and databases - the fish in your project's pond
 *
 *       /\     /\
 *      {  `---'  }
 *      {  O   O  }
 *      ~~>  V  <~~
 *       \  \|/  /
 *        `-----'____
 *        /     \    \_
 *       {       }\  )_\_   _
 *       |  \_/  |/ /  \_\_/ )
 *        \__/  /(_/     \__/
 *          (__/
 */
export const serviceTable = pgTable(
  'service',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projectTable.id, { onDelete: 'cascade' }),
    environmentId: uuid('environment_id')
      .notNull()
      .references(() => environmentTable.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    sourceType: text('source_type', { enum: ['image', 'git', 'template'] }).notNull(),
    sourceConfig: jsonb('source_config').notNull(),
    envVars: text('env_vars'), // Encrypted JSON string
    ports: jsonb('ports').default([]).notNull(),
    volumeMounts: jsonb('volume_mounts').default([]).notNull(),
    // Typed via ServiceSettings (schemas/services) — holds manual ingress rules.
    settings: jsonb('settings').default({}).notNull(),
    status: text('status', {
      enum: ['created', 'building', 'starting', 'running', 'stopping', 'stopped', 'error'],
    })
      .default('created')
      .notNull(),
    containerId: text('container_id'),
    canvasPosition: jsonb('canvas_position').default({ x: 0, y: 0 }).notNull(),
    createdAt: timestamp('created_at')
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp('updated_at')
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('service_projectId_idx').on(table.projectId),
    index('service_environmentId_idx').on(table.environmentId),
  ],
)

/**
 * ^._.^ Service Relations ^._.^
 * Services live inside projects like fish in a pond
 */
export const serviceRelations = relations(serviceTable, ({ one }) => ({
  project: one(projectTable, {
    fields: [serviceTable.projectId],
    references: [projectTable.id],
  }),
  environment: one(environmentTable, {
    fields: [serviceTable.environmentId],
    references: [environmentTable.id],
  }),
}))

/**
 * /ᐠ. ᴗ.ᐟ\ Extended Project Relations /ᐠ. ᴗ.ᐟ\
 * Adding the services relation here to avoid circular imports
 */
export const projectServicesRelations = relations(projectTable, ({ many }) => ({
  services: many(serviceTable),
}))
