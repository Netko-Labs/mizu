import {
  getDatabase,
  getDatabaseConnectionInfo,
  getDatabaseStatus,
  listDatabases,
} from '@mizu/minato-service'
import { z } from 'zod'
import { protectedProcedure, router } from '../../init'

export const databasesQueries = router({
  list: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ input }) => {
      return listDatabases(input.projectId)
    }),

  getById: protectedProcedure
    .input(z.object({ databaseId: z.string().uuid() }))
    .query(async ({ input }) => {
      return getDatabase(input.databaseId)
    }),

  getStatus: protectedProcedure
    .input(z.object({ databaseId: z.string().uuid() }))
    .query(async ({ input }) => {
      return getDatabaseStatus(input.databaseId)
    }),

  getConnectionInfo: protectedProcedure
    .input(z.object({ databaseId: z.string().uuid() }))
    .query(async ({ input }) => {
      return getDatabaseConnectionInfo(input.databaseId)
    }),
})
