import { z } from 'zod'

export const EnvironmentListQuerySchema = z.object({
  projectId: z.uuid(),
})

export type EnvironmentListQuery = z.infer<typeof EnvironmentListQuerySchema>
