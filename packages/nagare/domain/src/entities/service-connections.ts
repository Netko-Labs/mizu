import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import type { z } from 'zod'
import {
  type ConnectionType,
  serviceConnectionTable,
  type TargetType,
} from '../db/service-connections'

/**
 * ≽^•⩊•^≼ Service Connection Schemas ≽^•⩊•^≼
 * Validation for the tangled yarn between services
 */
export const ServiceConnectionInsertSchema = createInsertSchema(serviceConnectionTable)
export type ServiceConnectionInsert = z.infer<typeof ServiceConnectionInsertSchema>

export const ServiceConnectionUpdateSchema = createUpdateSchema(serviceConnectionTable).required({
  id: true,
})
export type ServiceConnectionUpdate = z.infer<typeof ServiceConnectionUpdateSchema>

export const ServiceConnectionSchema = createSelectSchema(serviceConnectionTable)
export type ServiceConnection = z.infer<typeof ServiceConnectionSchema>

// Re-export types from db
export type { ConnectionType, TargetType }
