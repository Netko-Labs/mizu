import {
  getProject,
  getProjectBySlug,
  getProjectFiles,
  getProjectWithServices,
  listProjects,
} from '@mizu/minato-service'
import { z } from 'zod'
import { protectedProcedure, router } from '../../init'

export const projectsQueries = router({
  list: protectedProcedure
    .input(z.object({ workspaceId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return listProjects(ctx.user.id, input.workspaceId)
    }),

  getById: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ input }) => {
      return getProject(input.projectId)
    }),

  getBySlug: protectedProcedure
    .input(z.object({ workspaceId: z.string().uuid(), slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return getProjectBySlug(ctx.user.id, input.workspaceId, input.slug)
    }),

  getWithServices: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ input }) => {
      return getProjectWithServices(input.projectId)
    }),

  getGeneratedFiles: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ input }) => {
      return getProjectFiles(input.projectId)
    }),
})
