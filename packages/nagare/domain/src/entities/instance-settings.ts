import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import type { z } from 'zod'
import { instanceSettingTable } from '../db'

/**
 * ≽^•⩊•^≼ Instance Settings Schemas ≽^•⩊•^≼
 * Validation for global Mizu instance configuration
 */
export const InstanceSettingInsertSchema = createInsertSchema(instanceSettingTable)
export type InstanceSettingInsert = z.infer<typeof InstanceSettingInsertSchema>

export const InstanceSettingUpdateSchema = createUpdateSchema(instanceSettingTable).required({
  id: true,
})
export type InstanceSettingUpdate = z.infer<typeof InstanceSettingUpdateSchema>

export const InstanceSettingSchema = createSelectSchema(instanceSettingTable)
export type InstanceSetting = z.infer<typeof InstanceSettingSchema>
