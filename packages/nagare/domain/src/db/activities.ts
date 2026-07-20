import { relations } from 'drizzle-orm'
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { ACTIVITY_TYPES } from '../values/activity-types'
import { environmentTable } from './environments'
import { jsonb } from './lib/jsonb'
import { projectTable } from './projects'

/**
 * 📜 Activity Table 📜
 * The project's event trail — deploys, starts, stops, edits — who did what,
 * when. Entity references are plain columns (no FK) so the feed outlives the
 * entities it describes.
 *
 *    ∧,,,∧
 *   ( ̳• · • ̳)  "web deployed 2m ago"
 *   /    づ♡
 */
export const activityTable = pgTable(
  'activity',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projectTable.id, { onDelete: 'cascade' }),
    // Nullable + set-null so the feed survives environment deletion.
    environmentId: uuid('environment_id').references(() => environmentTable.id, {
      onDelete: 'set null',
    }),
    type: text('type', { enum: ACTIVITY_TYPES }).notNull(),
    entityType: text('entity_type', {
      enum: ['service', 'database', 'project', 'environment'],
    }).notNull(),
    // No FK — the entity may be deleted; the feed keeps its story.
    entityId: uuid('entity_id').notNull(),
    // Denormalized so deleted entities still render by name.
    entityName: text('entity_name').notNull(),
    // JWT sub + display name; null = system. Denormalized — nagare cannot
    // join minato's auth tables.
    userId: text('user_id'),
    userName: text('user_name'),
    // Event context (e.g. { fields: ['ports'] }, { deploymentId }) — NEVER env
    // values or other secrets.
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [index('activity_projectId_createdAt_idx').on(table.projectId, table.createdAt)],
)

/**
 * ^._.^ Activity Relations ^._.^
 */
export const activityRelations = relations(activityTable, ({ one }) => ({
  project: one(projectTable, {
    fields: [activityTable.projectId],
    references: [projectTable.id],
  }),
}))
