import { z } from 'zod'
import { ProjectSettingsSchema } from './project-settings-schema'

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullish(),
  settings: ProjectSettingsSchema.optional(),
})

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>
