import { z } from 'zod'

export const TemplateCategorySchema = z.object({
  category: z.enum(['database', 'cache', 'web', 'tool', 'other']),
})

export type TemplateCategoryParams = z.infer<typeof TemplateCategorySchema>
