import { z } from 'zod'

export const ProjectBySlugQuerySchema = z.object({
  workspaceId: z.uuid(),
})

export type ProjectBySlugQuery = z.infer<typeof ProjectBySlugQuerySchema>
