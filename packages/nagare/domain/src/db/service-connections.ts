import { relations } from 'drizzle-orm'
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { databaseTable } from './databases'
import { envGroupTable } from './env-groups'
import { externalServiceTable } from './external-services'
import { networkTable } from './networks'
import { serviceTable } from './services'

/**
 * ≽^•⩊•^≼ Service Connections Table ≽^•⩊•^≼
 * Tracking the tangled yarn between services and databases
 *
 *     /\_____/\
 *    /  o   o  \
 *   ( ==  ^  == )   "connections flow like water~"
 *    )         (
 *   (           )
 *  ( (  )   (  ) )
 * (__(__)___(__)__)
 */

export const targetTypeEnum = [
  'service',
  'database',
  'network',
  'external_service',
  'env_group',
] as const
export type TargetType = (typeof targetTypeEnum)[number]

export const connectionTypeEnum = ['depends', 'connects', 'mounts', 'uses'] as const
export type ConnectionType = (typeof connectionTypeEnum)[number]

export const serviceConnectionTable = pgTable(
  'service_connection',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    fromServiceId: uuid('from_service_id')
      .notNull()
      .references(() => serviceTable.id, { onDelete: 'cascade' }),
    toServiceId: uuid('to_service_id').references(() => serviceTable.id, { onDelete: 'set null' }),
    toDatabaseId: uuid('to_database_id').references(() => databaseTable.id, {
      onDelete: 'set null',
    }),
    toNetworkId: uuid('to_network_id').references(() => networkTable.id, { onDelete: 'set null' }),
    toExternalServiceId: uuid('to_external_service_id').references(() => externalServiceTable.id, {
      onDelete: 'set null',
    }),
    toEnvGroupId: uuid('to_env_group_id').references(() => envGroupTable.id, {
      onDelete: 'set null',
    }),
    targetType: text('target_type', { enum: targetTypeEnum }).notNull(),
    connectionType: text('connection_type', { enum: connectionTypeEnum }).notNull(),
    envVarName: text('env_var_name'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index('service_connection_fromServiceId_idx').on(table.fromServiceId),
    index('service_connection_toServiceId_idx').on(table.toServiceId),
    index('service_connection_toDatabaseId_idx').on(table.toDatabaseId),
    index('service_connection_toNetworkId_idx').on(table.toNetworkId),
    index('service_connection_toExternalServiceId_idx').on(table.toExternalServiceId),
    index('service_connection_toEnvGroupId_idx').on(table.toEnvGroupId),
  ],
)

/**
 * ฅ^•ﻌ•^ฅ Service Connection Relations ฅ^•ﻌ•^ฅ
 * Where edges become friendships on the canvas
 */
export const serviceConnectionRelations = relations(serviceConnectionTable, ({ one }) => ({
  fromService: one(serviceTable, {
    fields: [serviceConnectionTable.fromServiceId],
    references: [serviceTable.id],
    relationName: 'outgoingConnections',
  }),
  toService: one(serviceTable, {
    fields: [serviceConnectionTable.toServiceId],
    references: [serviceTable.id],
    relationName: 'incomingConnections',
  }),
  toDatabase: one(databaseTable, {
    fields: [serviceConnectionTable.toDatabaseId],
    references: [databaseTable.id],
  }),
  toNetwork: one(networkTable, {
    fields: [serviceConnectionTable.toNetworkId],
    references: [networkTable.id],
  }),
  toExternalService: one(externalServiceTable, {
    fields: [serviceConnectionTable.toExternalServiceId],
    references: [externalServiceTable.id],
  }),
  toEnvGroup: one(envGroupTable, {
    fields: [serviceConnectionTable.toEnvGroupId],
    references: [envGroupTable.id],
  }),
}))
