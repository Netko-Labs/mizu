import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import type { z } from 'zod'
import { type ExternalServiceProtocol, type ExternalServiceType, externalServiceTable } from '../db'
import type { CanvasPosition } from './services'

/**
 * ≽^•⩊•^≼ External Service Schemas ≽^•⩊•^≼
 * Validation for third-party services
 */
export const ExternalServiceInsertSchema = createInsertSchema(externalServiceTable)
export type ExternalServiceInsert = z.infer<typeof ExternalServiceInsertSchema>

export const ExternalServiceUpdateSchema = createUpdateSchema(externalServiceTable).required({
  id: true,
})
export type ExternalServiceUpdate = z.infer<typeof ExternalServiceUpdateSchema>

export const ExternalServiceSchema = createSelectSchema(externalServiceTable)
export type ExternalService = z.infer<typeof ExternalServiceSchema>

/** External service credentials (decrypted) */
export interface ExternalServiceCredentials {
  apiKey?: string
  username?: string
  password?: string
  token?: string
  connectionString?: string
  [key: string]: string | undefined
}

/** External service canvas node data */
export interface ExternalServiceNodeData {
  id: string
  name: string
  type: ExternalServiceType
  host: string
  port?: number
  protocol: ExternalServiceProtocol
  canvasPosition: CanvasPosition
}
