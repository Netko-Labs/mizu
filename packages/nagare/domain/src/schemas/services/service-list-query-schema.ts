import { z } from 'zod'

export const ServiceListQuerySchema = z.object({
  projectId: z.uuid(),
})

export type ServiceListQuery = z.infer<typeof ServiceListQuerySchema>
