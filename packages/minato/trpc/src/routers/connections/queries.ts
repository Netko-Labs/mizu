import { listConnectionsForProject, listConnectionsForService } from '@mizu/minato-service'
import { z } from 'zod'
import { protectedProcedure, router } from '../../init'

export const connectionsQueries = router({
  listForService: protectedProcedure
    .input(z.object({ serviceId: z.string().uuid() }))
    .query(async ({ input }) => {
      return listConnectionsForService(input.serviceId)
    }),

  listForProject: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ input }) => {
      return listConnectionsForProject(input.projectId)
    }),
})
