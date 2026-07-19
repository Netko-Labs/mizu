import { z } from 'zod'

export const DeploymentListQuerySchema = z.object({
  serviceId: z.uuid(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
})

export type DeploymentListQuery = z.infer<typeof DeploymentListQuerySchema>
