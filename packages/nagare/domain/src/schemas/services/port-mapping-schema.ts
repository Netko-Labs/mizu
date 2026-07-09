import { z } from 'zod'

export const PortMappingSchema = z.object({
  container: z.number().int().positive(),
  host: z.number().int().positive().optional(),
  protocol: z.enum(['tcp', 'udp']).optional(),
})

export type PortMappingInput = z.infer<typeof PortMappingSchema>
