import { IconChevronRight } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { metricQueries } from '@/shared/api'
import { DrawerSection, Sparkline, type SparklinePoint } from '../shared'
import type { MetricPreviewCardProps, MetricsPreviewProps } from './lib'

const POLL_MS = 15_000

/** CPU + memory sparkline cards that deep-link into the Metrics tab. */
export function MetricsPreview({ service, onOpenTab }: MetricsPreviewProps) {
  const { data: metrics, isLoading } = useQuery({
    ...metricQueries.byService(service.id),
    refetchInterval: POLL_MS,
  })
  const samples = metrics?.samples ?? []
  const latest = samples.at(-1)

  const emptyCopy = isLoading
    ? 'Loading metrics…'
    : service.status !== 'running'
      ? 'Metrics appear while the service is running.'
      : metrics && !metrics.available
        ? "This image can't be sampled — metrics unavailable."
        : 'Collecting first samples — charts appear within a minute.'

  const action = onOpenTab && (
    <button
      type="button"
      onClick={() => onOpenTab('metrics')}
      className="flex items-center gap-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
    >
      Metrics <IconChevronRight className="size-3" />
    </button>
  )

  if (samples.length === 0 || !metrics?.available) {
    return (
      <DrawerSection title="Metrics" action={action}>
        <p className="py-3 text-center text-[11px] text-muted-foreground">{emptyCopy}</p>
      </DrawerSection>
    )
  }

  const cpuData: SparklinePoint[] = samples.map((s) => ({ t: s.t, v: s.cpuPercent }))
  const memData: SparklinePoint[] = samples.map((s) => ({ t: s.t, v: s.memUsedMb }))

  return (
    <DrawerSection title="Metrics" action={action}>
      <div className="grid grid-cols-2 gap-2">
        <PreviewCard
          label="CPU"
          value={`${latest?.cpuPercent ?? 0}%`}
          data={cpuData}
          color="var(--chart-1)"
          onClick={() => onOpenTab?.('metrics')}
        />
        <PreviewCard
          label="Memory"
          value={`${latest?.memUsedMb ?? 0} MB`}
          data={memData}
          color="var(--chart-2)"
          onClick={() => onOpenTab?.('metrics')}
        />
      </div>
    </DrawerSection>
  )
}

function PreviewCard({ label, value, data, color, onClick }: MetricPreviewCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-1 rounded-lg border border-border bg-background/40 px-3 pt-2.5 pb-1 text-left transition-colors hover:border-foreground/20"
    >
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-semibold tabular-nums text-foreground">{value}</span>
      <Sparkline data={data} color={color} />
    </button>
  )
}
