import { z } from 'zod'

export const UpdateEnvironmentSchema = z.object({
  name: z.string().min(1).max(50),
})

export type UpdateEnvironmentInput = z.infer<typeof UpdateEnvironmentSchema>
