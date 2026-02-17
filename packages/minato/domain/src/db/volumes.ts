import { relations } from 'drizzle-orm'
import { bigint, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { projectTable } from './projects'

/**
 * ╭──────────────────────────────────────╮
 * │  🐱 Volumes Table 🐱                │
 * │  Persistent storage for those who   │
 * │  don't believe in nine lives        │
 * ╰──────────────────────────────────────╯
 *        |\---/|
 *        | o_o |
 *         \_^_/
 *        /|   |\
 *       (_|   |_)
 */

export const volumeTable = pgTable(
  'volume',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projectTable.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    dockerVolumeName: text('docker_volume_name'),
    path: text('path'),
    sizeBytes: bigint('size_bytes', { mode: 'bigint' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('volume_projectId_idx').on(table.projectId)],
)

/**
 * ≽^•⩊•^≼ Volume Relations ≽^•⩊•^≼
 * Volumes attach to projects like a cat claims its favorite box
 */
export const volumeTableRelations = relations(volumeTable, ({ one }) => ({
  project: one(projectTable, {
    fields: [volumeTable.projectId],
    references: [projectTable.id],
  }),
}))
