import { useId } from 'react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import type { SparklineProps } from './lib'

/**
 * A minimal recharts area — no axes, grid, or tooltip. A single series with a
 * gradient fill for the Overview metric previews.
 */
export function Sparkline({ data, color, height = 40 }: SparklineProps) {
  const gradientId = useId()
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
