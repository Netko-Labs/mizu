import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import type { z } from 'zod'
import { workspaceTable } from '../db'

/**
 * ≽^•⩊•^≼ Workspace Schemas ≽^•⩊•^≼
 * Validation for your workspace containers
 */
export const WorkspaceInsertSchema = createInsertSchema(workspaceTable)
export type WorkspaceInsert = z.infer<typeof WorkspaceInsertSchema>

export const WorkspaceUpdateSchema = createUpdateSchema(workspaceTable).required({ id: true })
export type WorkspaceUpdate = z.infer<typeof WorkspaceUpdateSchema>

export const WorkspaceSchema = createSelectSchema(workspaceTable)
export type Workspace = z.infer<typeof WorkspaceSchema>

/** Workspace settings */
export interface WorkspaceSettings {
  defaultMizuPath?: string
  theme?: 'light' | 'dark' | 'system'
}
