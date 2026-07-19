import { useQuery } from '@tanstack/react-query'
import { Spinner } from '@/components/ui/spinner'
import { metricQueries } from '@/shared/api'
import type { MetricsTabProps } from './lib/types'
import { CPU_CHART_CONFIG, MEMORY_CHART_CONFIG, METRICS_POLL_MS } from './lib/values'
import { MetricChartCard } from './metric-chart-card'

/** Live CPU/memory charts over the daemon's ~1h in-memory sample window. */
export function MetricsTab({ service }: MetricsTabProps) {
  const { data: metrics, isLoading } = useQuery({
    ...metricQueries.byService(service.id),
    refetchInterval: METRICS_POLL_MS,
  })

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4 py-6 text-xs text-muted-foreground">
        <Spinner className="size-3" /> Loading metrics…
      </div>
    )
  }

  const samples = metrics?.samples ?? []
  if (!metrics?.available || samples.length === 0) {
    return (
      <div className="p-4 py-8 text-center text-xs text-muted-foreground">
        {service.status !== 'running'
          ? 'Metrics appear while the service is running.'
          : metrics && !metrics.available
            ? "This image can't be sampled (no /proc access) — metrics unavailable."
            : 'Collecting first samples — charts appear within a minute.'}
      </div>
    )
  }

  const latest = samples.at(-1)

  return (
    <div className="space-y-4 p-4">
      <MetricChartCard
        title="CPU"
        currentLabel={`${latest?.cpuPercent ?? 0}%`}
        dataKey="cpuPercent"
        samples={samples}
        config={CPU_CHART_CONFIG}
        unit="%"
      />
      <MetricChartCard
        title="Memory"
        currentLabel={`${latest?.memUsedMb ?? 0} / ${latest?.memTotalMb ?? 0} MB`}
        dataKey="memUsedMb"
        samples={samples}
        config={MEMORY_CHART_CONFIG}
        yMax={latest?.memTotalMb}
        unit="MB"
      />
      <p className="text-[10px] text-muted-foreground">
        Sampled every {Math.round((metrics.intervalMs ?? 15000) / 1000)}s · ~1h window · resets on
        daemon restart
      </p>
    </div>
  )
}
