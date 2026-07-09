import { z } from 'zod'

/** Server → client events on the log stream WS. Sent as JSON strings. */
export const LogStreamEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('log'),
    timestamp: z.string(),
    stream: z.enum(['stdout', 'stderr']),
    message: z.string(),
  }),
  z.object({ type: z.literal('error'), error: z.string() }),
  z.object({ type: z.literal('end') }),
])

export type LogStreamEvent = z.infer<typeof LogStreamEventSchema>
