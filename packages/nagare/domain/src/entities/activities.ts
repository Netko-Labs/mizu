import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import type { z } from 'zod'
import { activityTable } from '../db'

/**
 * 📜 Activity Schemas 📜
 * Validation for the project's event trail
 */
export const ActivityInsertSchema = createInsertSchema(activityTable)
export type ActivityInsert = z.infer<typeof ActivityInsertSchema>

export const ActivitySchema = createSelectSchema(activityTable)
export type Activity = z.infer<typeof ActivitySchema>
