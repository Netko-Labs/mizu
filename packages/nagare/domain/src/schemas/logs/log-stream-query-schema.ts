import { z } from 'zod'

/**
 * WS handshake query for the log stream. Must be declared on the `.ws()` route
 * or Elysia 2 leaves `ws.query` empty. `cid` is a client-generated connection id
 * (Elysia 2's `ws.id` is unreliable). Exactly one of serviceId/databaseId.
 */
export const LogStreamQuerySchema = z
  .object({
    token: z.string(),
    cid: z.string(),
    serviceId: z.uuid().optional(),
    databaseId: z.uuid().optional(),
  })
  .refine((query) => !!query.serviceId !== !!query.databaseId, {
    message: 'Provide exactly one of serviceId or databaseId',
  })

export type LogStreamQuery = z.infer<typeof LogStreamQuerySchema>
