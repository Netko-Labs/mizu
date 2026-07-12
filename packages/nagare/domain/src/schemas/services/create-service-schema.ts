import { z } from 'zod'
import { PortMappingSchema } from './port-mapping-schema'
import { SourceConfigSchema } from './source-config-schema'

export const CreateServiceSchema = z.object({
  projectId: z.uuid(),
  // Target environment; defaults to the project's default environment.
  environmentId: z.uuid().optional(),
  name: z.string().min(1).max(100),
  sourceType: z.enum(['image', 'git', 'template']),
  sourceConfig: SourceConfigSchema,
  ports: z.array(PortMappingSchema).optional(),
})

export type CreateServiceInput = z.infer<typeof CreateServiceSchema>
