import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import type { z } from 'zod'
import { environmentTable } from '../db'

/**
 * ≽^•⩊•^≼ Environment Schemas ≽^•⩊•^≼
 * Validation for a project's parallel worlds
 */
export const EnvironmentInsertSchema = createInsertSchema(environmentTable)
export type EnvironmentInsert = z.infer<typeof EnvironmentInsertSchema>

export const EnvironmentUpdateSchema = createUpdateSchema(environmentTable).required({ id: true })
export type EnvironmentUpdate = z.infer<typeof EnvironmentUpdateSchema>

export const EnvironmentSchema = createSelectSchema(environmentTable)
export type Environment = z.infer<typeof EnvironmentSchema>
