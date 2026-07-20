import type { ReactNode } from 'react'

export interface StatTileProps {
  label: string
  value: ReactNode
  /** Optional unit or secondary line under the value. */
  sub?: ReactNode
  /** Status dot color class (e.g. `bg-emerald-400`) rendered before the value. */
  dot?: string
  /** Render the value in a mono font and truncate long strings. */
  mono?: boolean
  onClick?: () => void
}

export interface DrawerSectionProps {
  title: string
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
}

export interface SparklinePoint {
  t: number
  v: number
}

export interface SparklineProps {
  data: SparklinePoint[]
  /** Stroke + gradient color (CSS color string). */
  color: string
  height?: number
}
