import { z } from 'zod'

export const UpdateDatabaseSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  version: z.string().optional(),
  credentials: z.string().optional(),
})

export type UpdateDatabaseInput = z.infer<typeof UpdateDatabaseSchema>
