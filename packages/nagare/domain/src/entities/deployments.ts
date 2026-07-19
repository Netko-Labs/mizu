import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import type { z } from 'zod'
import { deploymentTable } from '../db'

/**
 * 🚀 Deployment Schemas 🚀
 * Validation for the launch history
 */
export const DeploymentInsertSchema = createInsertSchema(deploymentTable)
export type DeploymentInsert = z.infer<typeof DeploymentInsertSchema>

export const DeploymentSchema = createSelectSchema(deploymentTable)
export type Deployment = z.infer<typeof DeploymentSchema>

/** The list-endpoint row — history without the encrypted env snapshot. */
export type DeploymentListItem = Omit<Deployment, 'envVarsSnapshot'>
