import type { Project, TailscaleInfo } from '@mizu/nagare-domain'
import type { Serialized } from '@/shared/api'

export type RecentProject = Serialized<Project>

export interface ProjectItemProps {
  name: string
  slug: string
  description?: string | null
  delay?: number
}

export interface HomeRecentProjectsProps {
  projects: RecentProject[]
  isLoading: boolean
  hasWorkspace: boolean
}

/** Derived hero data: the machine identity line + status dots. */
export interface HostBand {
  hostname: string
  osLine: string
  runtimeAvailable: boolean
  tailnetDnsName: string | null
}

/** One compact tile in the stat strip, meter math pre-computed. */
export interface MeterTile {
  id: string
  label: string
  value: string
  percent: number
  toneClass: string
  sub: string
}

/** One dotted-leader key/value line in the runtime.info card. */
export interface RuntimeLine {
  label: string
  value: string
  accent?: boolean
}

export interface HomeHostBandProps {
  host: HostBand | null
  isLoading: boolean
}

export interface HomeStatStripProps {
  tiles: MeterTile[]
  tailnet: TailscaleInfo | null
  isLoading: boolean
}

export interface StatMeterTileProps {
  tile: MeterTile
  delay?: number
}

export interface HomeTailnetTileProps {
  tailnet: TailscaleInfo | null
  delay?: number
}

export interface HomeQuickActionsProps {
  runtimeLines: RuntimeLine[]
}
