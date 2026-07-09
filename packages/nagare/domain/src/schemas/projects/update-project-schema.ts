import { z } from 'zod'

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullish(),
  settings: z.record(z.string(), z.unknown()).optional(),
})

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>
