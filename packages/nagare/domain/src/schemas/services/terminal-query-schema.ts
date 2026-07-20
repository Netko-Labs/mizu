import { z } from 'zod'

/** WS auth for the interactive terminal: minato JWT + client-unique id. */
export const TerminalQuerySchema = z.object({
  serviceId: z.uuid(),
  token: z.string(),
  cid: z.string(),
})

export type TerminalQuery = z.infer<typeof TerminalQuerySchema>
