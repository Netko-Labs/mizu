import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import type { z } from 'zod'
import { projectTable } from '../db'

/**
 * ≽^•⩊•^≼ Project Schemas ≽^•⩊•^≼
 * Validation for your deployment homes
 */
export const ProjectInsertSchema = createInsertSchema(projectTable)
export type ProjectInsert = z.infer<typeof ProjectInsertSchema>

export const ProjectUpdateSchema = createUpdateSchema(projectTable).required({ id: true })
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>

export const ProjectSchema = createSelectSchema(projectTable)
export type Project = z.infer<typeof ProjectSchema>
