import { z } from 'zod'

/** Optional `?environmentId=` filter for project-scoped reads. */
export const EnvironmentScopeQuerySchema = z.object({
  environmentId: z.uuid().optional(),
})

export type EnvironmentScopeQuery = z.infer<typeof EnvironmentScopeQuerySchema>
