import {
  createDatabase,
  deleteDatabase,
  deployDatabase,
  startDatabase,
  stopDatabase,
  updateDatabase,
  updateDatabaseCanvasPosition,
} from '@mizu/minato-service'
import { z } from 'zod'
import { protectedProcedure, router } from '../../init'

export const databasesMutations = router({
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        type: z.enum(['postgres', 'mysql', 'redis', 'mongodb', 'mariadb']),
        name: z.string().min(1).max(100),
        version: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return createDatabase(input)
    }),

  update: protectedProcedure
    .input(
      z.object({
        databaseId: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        version: z.string().optional(),
        credentials: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { databaseId, ...data } = input
      return updateDatabase(databaseId, data)
    }),

  delete: protectedProcedure
    .input(z.object({ databaseId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return deleteDatabase(input.databaseId)
    }),

  deploy: protectedProcedure
    .input(z.object({ databaseId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return deployDatabase(input.databaseId)
    }),

  start: protectedProcedure
    .input(z.object({ databaseId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return startDatabase(input.databaseId)
    }),

  stop: protectedProcedure
    .input(z.object({ databaseId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return stopDatabase(input.databaseId)
    }),

  updatePosition: protectedProcedure
    .input(
      z.object({
        databaseId: z.string().uuid(),
        position: z.object({ x: z.number(), y: z.number() }),
      }),
    )
    .mutation(async ({ input }) => {
      return updateDatabaseCanvasPosition(input.databaseId, input.position)
    }),
})
