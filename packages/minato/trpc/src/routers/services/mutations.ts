import {
  createService,
  deleteService,
  deployService,
  restartService,
  startService,
  stopService,
  updateCanvasPosition,
  updateService,
} from '@mizu/minato-service'
import { z } from 'zod'
import { protectedProcedure, router } from '../../init'

const sourceConfigSchema = z.union([
  z.object({ image: z.string(), tag: z.string().optional() }),
  z.object({
    repository: z.string(),
    branch: z.string().optional(),
    buildCommand: z.string().optional(),
    startCommand: z.string().optional(),
    dockerfile: z.string().optional(),
  }),
  z.object({ templateId: z.string(), overrides: z.record(z.unknown()).optional() }),
])

const portMappingSchema = z.object({
  container: z.number().int().positive(),
  host: z.number().int().positive().optional(),
  protocol: z.enum(['tcp', 'udp']).optional(),
})

export const servicesMutations = router({
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        name: z.string().min(1).max(100),
        sourceType: z.enum(['image', 'git', 'template']),
        sourceConfig: sourceConfigSchema,
        ports: z.array(portMappingSchema).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return createService({
        projectId: input.projectId,
        name: input.name,
        sourceType: input.sourceType,
        sourceConfig: input.sourceConfig,
        ports: input.ports,
      })
    }),

  update: protectedProcedure
    .input(
      z.object({
        serviceId: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        sourceConfig: sourceConfigSchema.optional(),
        ports: z.array(portMappingSchema).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { serviceId, ...data } = input
      return updateService(serviceId, data)
    }),

  updatePosition: protectedProcedure
    .input(
      z.object({
        serviceId: z.string().uuid(),
        position: z.object({ x: z.number(), y: z.number() }),
      }),
    )
    .mutation(async ({ input }) => {
      return updateCanvasPosition(input.serviceId, input.position)
    }),

  delete: protectedProcedure
    .input(z.object({ serviceId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return deleteService(input.serviceId)
    }),

  deploy: protectedProcedure
    .input(z.object({ serviceId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return deployService(input.serviceId)
    }),

  start: protectedProcedure
    .input(z.object({ serviceId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return startService(input.serviceId)
    }),

  stop: protectedProcedure
    .input(z.object({ serviceId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return stopService(input.serviceId)
    }),

  restart: protectedProcedure
    .input(z.object({ serviceId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return restartService(input.serviceId)
    }),
})
