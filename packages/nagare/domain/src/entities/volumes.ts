import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import type { z } from 'zod'
import { volumeTable } from '../db'

/**
 * 🐱 Volume Schemas 🐱
 * Validation for persistent storage
 */
export const VolumeInsertSchema = createInsertSchema(volumeTable)
export type VolumeInsert = z.infer<typeof VolumeInsertSchema>

export const VolumeUpdateSchema = createUpdateSchema(volumeTable).required({ id: true })
export type VolumeUpdate = z.infer<typeof VolumeUpdateSchema>

export const VolumeSchema = createSelectSchema(volumeTable)
export type Volume = z.infer<typeof VolumeSchema>
