import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import type { z } from 'zod'
import { networkTable } from '../db'
import type { CanvasPosition } from './services'

/**
 * ≽^•⩊•^≼ Network Schemas ≽^•⩊•^≼
 * Validation for Docker networks
 */
export const NetworkInsertSchema = createInsertSchema(networkTable)
export type NetworkInsert = z.infer<typeof NetworkInsertSchema>

export const NetworkUpdateSchema = createUpdateSchema(networkTable).required({ id: true })
export type NetworkUpdate = z.infer<typeof NetworkUpdateSchema>

export const NetworkSchema = createSelectSchema(networkTable)
export type Network = z.infer<typeof NetworkSchema>

/** Network canvas node data */
export interface NetworkNodeData {
  id: string
  name: string
  subnet?: string
  gateway?: string
  internal: boolean
  canvasPosition: CanvasPosition
}
