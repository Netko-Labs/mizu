import { createProject, deleteProject, updateProject } from '@mizu/minato-service'
import { z } from 'zod'
import { protectedProcedure, router } from '../../init'

export const projectsMutations = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        workspaceId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return createProject({
        userId: ctx.user.id,
        workspaceId: input.workspaceId,
        name: input.name,
        description: input.description,
      })
    }),

  update: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).nullish(),
      }),
    )
    .mutation(async ({ input }) => {
      const { projectId, ...data } = input
      return updateProject(projectId, data)
    }),

  delete: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return deleteProject(input.projectId)
    }),
})
