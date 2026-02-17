import { getDatabase, getService, streamContainerLogs } from '@mizu/minato-service'
import { z } from 'zod'
import { protectedProcedure, router } from '../../init'

export const logsSubscriptions = router({
  stream: protectedProcedure
    .input(
      z.object({
        serviceId: z.string().uuid().optional(),
        databaseId: z.string().uuid().optional(),
      }),
    )
    .subscription(async function* ({ input }) {
      // Get container ID from service or database
      let containerId: string | null = null

      if (input.serviceId) {
        const service = await getService(input.serviceId)
        containerId = service?.containerId ?? null
      } else if (input.databaseId) {
        const database = await getDatabase(input.databaseId)
        containerId = database?.containerId ?? null
      }

      if (!containerId) {
        yield { error: 'No container found' }
        return
      }

      // Stream logs using the async generator
      for await (const logEntry of streamContainerLogs(containerId)) {
        yield logEntry
      }
    }),
})
