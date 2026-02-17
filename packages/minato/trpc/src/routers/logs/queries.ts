import { getContainerLogs } from '@mizu/minato-service'
import { z } from 'zod'
import { protectedProcedure, router } from '../../init'

export const logsQueries = router({
  get: protectedProcedure
    .input(
      z.object({
        containerId: z.string(),
        tail: z.number().int().positive().max(1000).optional().default(100),
      }),
    )
    .query(async ({ input }) => {
      return getContainerLogs(input.containerId, input.tail)
    }),
})
