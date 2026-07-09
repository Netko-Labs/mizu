import { z } from 'zod'

export const DatabaseListQuerySchema = z.object({
  projectId: z.uuid(),
})

export type DatabaseListQuery = z.infer<typeof DatabaseListQuerySchema>
