import { z } from 'zod'

export const ServiceListQuerySchema = z.object({
  projectId: z.uuid(),
  environmentId: z.uuid().optional(),
})

export type ServiceListQuery = z.infer<typeof ServiceListQuerySchema>
