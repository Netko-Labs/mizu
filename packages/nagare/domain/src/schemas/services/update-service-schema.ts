import { z } from 'zod'
import { PortMappingSchema } from './port-mapping-schema'
import { SourceConfigSchema } from './source-config-schema'

export const UpdateServiceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  sourceConfig: SourceConfigSchema.optional(),
  ports: z.array(PortMappingSchema).optional(),
})

export type UpdateServiceInput = z.infer<typeof UpdateServiceSchema>
