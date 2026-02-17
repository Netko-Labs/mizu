import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import type { z } from 'zod'
import { envGroupTable, serviceEnvGroupTable } from '../db'
import type { CanvasPosition } from './services'

/**
 * ≽^•⩊•^≼ Env Group Schemas ≽^•⩊•^≼
 * Validation for environment variable groups
 */
export const EnvGroupInsertSchema = createInsertSchema(envGroupTable)
export type EnvGroupInsert = z.infer<typeof EnvGroupInsertSchema>

export const EnvGroupUpdateSchema = createUpdateSchema(envGroupTable).required({ id: true })
export type EnvGroupUpdate = z.infer<typeof EnvGroupUpdateSchema>

export const EnvGroupSchema = createSelectSchema(envGroupTable)
export type EnvGroup = z.infer<typeof EnvGroupSchema>

/**
 * ≽^•⩊•^≼ Service-EnvGroup Link Schemas ≽^•⩊•^≼
 */
export const ServiceEnvGroupInsertSchema = createInsertSchema(serviceEnvGroupTable)
export type ServiceEnvGroupInsert = z.infer<typeof ServiceEnvGroupInsertSchema>

export const ServiceEnvGroupSchema = createSelectSchema(serviceEnvGroupTable)
export type ServiceEnvGroup = z.infer<typeof ServiceEnvGroupSchema>

/** Env group values structure (decrypted) */
export interface EnvGroupValues {
  [key: string]: string
}

/** Env group canvas node data */
export interface EnvGroupNodeData {
  id: string
  name: string
  isSecret: boolean
  keyCount: number
  canvasPosition: CanvasPosition
}
