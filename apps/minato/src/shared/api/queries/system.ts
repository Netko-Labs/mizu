import type {
  CpuStats,
  DashboardStats,
  DockerInfo,
  InitializeResult,
  MemoryStats,
  MizuStatus,
  SystemInfo,
} from '@mizu/nagare-domain'
import { queryOptions } from '@tanstack/react-query'
import { nagare } from '@/integrations/nagare'
import { unwrap } from '../utils'

// eden@1.4 infers these complex response objects as `{}` under Elysia 2, so
// results are cast against the response types owned by nagare-domain.

export const systemKeys = {
  all: ['system'] as const,
  dashboardStats: () => ['system', 'dashboard-stats'] as const,
  dockerInfo: () => ['system', 'docker-info'] as const,
  info: () => ['system', 'info'] as const,
  memory: () => ['system', 'memory'] as const,
  cpu: () => ['system', 'cpu'] as const,
  mizuStatus: () => ['system', 'mizu-status'] as const,
  templates: () => ['system', 'templates'] as const,
}

export const systemQueries = {
  dashboardStats: () =>
    queryOptions({
      queryKey: systemKeys.dashboardStats(),
      queryFn: async () =>
        (await unwrap(nagare.system['dashboard-stats'].get())) as unknown as DashboardStats,
    }),
  dockerInfo: () =>
    queryOptions({
      queryKey: systemKeys.dockerInfo(),
      queryFn: async () =>
        (await unwrap(nagare.system['docker-info'].get())) as unknown as DockerInfo,
    }),
  info: () =>
    queryOptions({
      queryKey: systemKeys.info(),
      queryFn: async () => (await unwrap(nagare.system.info.get())) as unknown as SystemInfo,
    }),
  memory: () =>
    queryOptions({
      queryKey: systemKeys.memory(),
      queryFn: async () => (await unwrap(nagare.system.memory.get())) as unknown as MemoryStats,
    }),
  cpu: () =>
    queryOptions({
      queryKey: systemKeys.cpu(),
      queryFn: async () => (await unwrap(nagare.system.cpu.get())) as unknown as CpuStats,
    }),
  mizuStatus: () =>
    queryOptions({
      queryKey: systemKeys.mizuStatus(),
      queryFn: async () =>
        (await unwrap(nagare.system['mizu-status'].get())) as unknown as MizuStatus,
    }),
  templates: () =>
    queryOptions({
      queryKey: systemKeys.templates(),
      queryFn: () => unwrap(nagare.templates.get()),
    }),
}

/** Side-effectful first-run setup — a POST, fire from a mutation (not a query). */
export const initializeMizu = async () =>
  (await unwrap(nagare.system.initialize.post())) as unknown as InitializeResult
