import {
  allTemplates,
  getCpuStats,
  getDashboardStats,
  getDockerInfo,
  getMemoryStats,
  getMizuStatus,
  getSystemInfo,
  getTemplateById,
  getTemplatesByCategory,
  initializeMizu,
  isDockerAvailable,
} from '@mizu/minato-service'
import { z } from 'zod'
import { protectedProcedure, publicProcedure, router } from '../../init'

export const systemQueries = router({
  // Health check - public
  health: publicProcedure.query(async () => {
    const dockerAvailable = await isDockerAvailable()
    return {
      status: 'ok',
      docker: dockerAvailable,
      timestamp: new Date().toISOString(),
    }
  }),

  // Docker info - protected
  dockerInfo: protectedProcedure.query(async () => {
    return getDockerInfo()
  }),

  // System info - protected
  systemInfo: protectedProcedure.query(async () => {
    return getSystemInfo()
  }),

  // Memory stats - protected
  memoryStats: protectedProcedure.query(() => {
    return getMemoryStats()
  }),

  // CPU stats - protected
  cpuStats: protectedProcedure.query(() => {
    return getCpuStats()
  }),

  // Mizu status - protected
  mizuStatus: protectedProcedure.query(async () => {
    return getMizuStatus()
  }),

  // Dashboard stats - protected (aggregated data for homepage)
  dashboardStats: protectedProcedure.query(async () => {
    return getDashboardStats()
  }),

  // Initialize Mizu directories - protected
  initialize: protectedProcedure.query(async () => {
    return initializeMizu()
  }),

  // Templates
  templates: protectedProcedure.query(async () => {
    return allTemplates
  }),

  templateById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return getTemplateById(input.id)
  }),

  templatesByCategory: protectedProcedure
    .input(z.object({ category: z.enum(['database', 'cache', 'web', 'tool', 'other']) }))
    .query(async ({ input }) => {
      return getTemplatesByCategory(input.category)
    }),
})
