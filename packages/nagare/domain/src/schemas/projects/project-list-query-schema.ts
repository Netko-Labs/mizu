import { z } from 'zod'

export const ProjectListQuerySchema = z.object({
  workspaceId: z.uuid(),
})

export type ProjectListQuery = z.infer<typeof ProjectListQuerySchema>
