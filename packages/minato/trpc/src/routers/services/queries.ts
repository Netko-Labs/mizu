import { getService, getServiceStatus, listServices } from '@mizu/minato-service'
import { z } from 'zod'
import { protectedProcedure, router } from '../../init'

export const servicesQueries = router({
  list: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ input }) => {
      return listServices(input.projectId)
    }),

  getById: protectedProcedure
    .input(z.object({ serviceId: z.string().uuid() }))
    .query(async ({ input }) => {
      return getService(input.serviceId)
    }),

  getStatus: protectedProcedure
    .input(z.object({ serviceId: z.string().uuid() }))
    .query(async ({ input }) => {
      return getServiceStatus(input.serviceId)
    }),
})
