import { z } from 'zod'

export const CreateDatabaseSchema = z.object({
  projectId: z.uuid(),
  type: z.enum(['postgres', 'mysql', 'redis', 'mongodb', 'mariadb']),
  name: z.string().min(1).max(100),
  version: z.string().optional(),
})

export type CreateDatabaseInput = z.infer<typeof CreateDatabaseSchema>
