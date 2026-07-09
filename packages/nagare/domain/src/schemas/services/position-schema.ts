import { z } from 'zod'

/** Canvas node position update — shared by services and databases. */
export const PositionSchema = z.object({
  position: z.object({ x: z.number(), y: z.number() }),
})

export type PositionInput = z.infer<typeof PositionSchema>
