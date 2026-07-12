import { relations } from 'drizzle-orm'
import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './auth'

/**
 * ≽^•⩊•^≼ Organization Table ≽^•⩊•^≼
 * A team — the tenancy boundary. Projects and every resource under them
 * belong to an organization; members share access per their role.
 */
export const organization = pgTable('organization', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logo: text('logo'),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/**
 * (=^･ω･^=) Member Table (=^･ω･^=)
 * Who belongs to which team, and their role (owner | admin | member).
 */
export const member = pgTable(
  'member',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: text('role').default('member').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('member_organizationId_idx').on(table.organizationId),
    index('member_userId_idx').on(table.userId),
  ],
)

/**
 * /ᐠ. ᴗ.ᐟ\ Invitation Table /ᐠ. ᴗ.ᐟ\
 * Pending invites to join a team.
 */
export const invitation = pgTable(
  'invitation',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: text('role'),
    status: text('status').default('pending').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    inviterId: text('inviter_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('invitation_organizationId_idx').on(table.organizationId)],
)

/**
 * ฅ^•ﻌ•^ฅ Organization Relations ฅ^•ﻌ•^ฅ
 */
export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
}))

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}))

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  inviter: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}))
