import { z } from 'zod'

export const CreateEnvironmentSchema = z.object({
  projectId: z.uuid(),
  name: z.string().min(1).max(50),
})

export type CreateEnvironmentInput = z.infer<typeof CreateEnvironmentSchema>
