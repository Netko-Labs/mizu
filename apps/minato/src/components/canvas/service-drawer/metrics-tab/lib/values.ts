import type { ChartConfig } from '@/components/ui/chart'

export const METRICS_POLL_MS = 15_000

export const CPU_CHART_CONFIG: ChartConfig = {
  cpuPercent: { label: 'CPU', color: 'var(--chart-1)' },
}

export const MEMORY_CHART_CONFIG: ChartConfig = {
  memUsedMb: { label: 'Memory', color: 'var(--chart-2)' },
}
