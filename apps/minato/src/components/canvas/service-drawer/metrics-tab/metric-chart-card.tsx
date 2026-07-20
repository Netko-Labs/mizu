import { Area, AreaChart, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { DrawerSection } from '../shared'
import type { MetricChartCardProps } from './lib/types'

/** Stat header + gradient area chart over the sample window. */
export function MetricChartCard({
  title,
  currentLabel,
  dataKey,
  samples,
  config,
  yMax,
  unit,
}: MetricChartCardProps) {
  const color = `var(--color-${dataKey})`
  const gradientId = `fill-${dataKey}`

  return (
    <DrawerSection
      title={title}
      action={
        <span className="text-lg font-semibold tabular-nums text-foreground">{currentLabel}</span>
      }
    >
      <ChartContainer config={config} className="h-[140px] w-full">
        <AreaChart data={samples} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="t"
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            minTickGap={40}
            tickFormatter={(t: number) =>
              new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
            className="text-[10px]"
          />
          <YAxis
            width={34}
            tickLine={false}
            axisLine={false}
            domain={yMax ? [0, yMax] : [0, 'auto']}
            tickFormatter={(v: number) => `${v}`}
            className="text-[10px]"
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const t = payload?.[0]?.payload?.t as number | undefined
                  return t ? new Date(t).toLocaleTimeString() : ''
                }}
                formatter={(value) => `${value} ${unit}`}
              />
            }
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>
    </DrawerSection>
  )
}
