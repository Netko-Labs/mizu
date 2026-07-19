import { z } from 'zod'

export const ActivityListQuerySchema = z.object({
  projectId: z.uuid(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  // Cursor: return entries strictly older than this timestamp.
  before: z.iso.datetime().optional(),
})

export type ActivityListQuery = z.infer<typeof ActivityListQuerySchema>
