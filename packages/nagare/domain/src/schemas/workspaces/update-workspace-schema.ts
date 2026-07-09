import { z } from 'zod'

export const UpdateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
})

export type UpdateWorkspaceInput = z.infer<typeof UpdateWorkspaceSchema>
