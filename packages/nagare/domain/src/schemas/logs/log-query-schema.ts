import { z } from 'zod'

/** Query params arrive as strings — coerce the tail count. */
export const LogQuerySchema = z.object({
  tail: z.coerce.number().int().positive().max(1000).default(100),
})

export type LogQuery = z.infer<typeof LogQuerySchema>
