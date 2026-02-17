import { createWorkspace, deleteWorkspace, updateWorkspace } from '@mizu/minato-service'
import { z } from 'zod'
import { protectedProcedure, router } from '../../init'

export const workspacesMutations = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return createWorkspace({
        userId: ctx.user.id,
        name: input.name,
      })
    }),

  update: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().uuid(),
        name: z.string().min(1).max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return updateWorkspace(input.workspaceId, ctx.user.id, { name: input.name })
    }),

  delete: protectedProcedure
    .input(z.object({ workspaceId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return deleteWorkspace(input.workspaceId, ctx.user.id)
    }),
})
