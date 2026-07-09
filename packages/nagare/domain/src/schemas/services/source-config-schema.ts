import { z } from 'zod'

export const SourceConfigSchema = z.union([
  z.object({ image: z.string(), tag: z.string().optional() }),
  z.object({
    repository: z.string(),
    branch: z.string().optional(),
    buildCommand: z.string().optional(),
    startCommand: z.string().optional(),
    dockerfile: z.string().optional(),
  }),
  z.object({ templateId: z.string(), overrides: z.record(z.string(), z.unknown()).optional() }),
])

export type SourceConfigInput = z.infer<typeof SourceConfigSchema>
