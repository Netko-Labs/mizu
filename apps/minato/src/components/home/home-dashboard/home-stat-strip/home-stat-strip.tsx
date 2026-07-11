import { Skeleton } from '@/components/ui/skeleton'
import type { HomeStatStripProps } from '../lib/types'
import { HomeTailnetTile } from './home-tailnet-tile'
import { StatMeterTile } from './stat-meter-tile'

export function HomeStatStrip({ tiles, tailnet, isLoading }: HomeStatStripProps) {
  if (isLoading) {
    return (
      <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={String(i)}
            className="h-[102px] rounded-lg border border-neutral-800 bg-neutral-950"
          />
        ))}
      </section>
    )
  }

  return (
    <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {tiles.map((tile, index) => (
        <StatMeterTile key={tile.id} tile={tile} delay={0.1 + index * 0.05} />
      ))}
      <HomeTailnetTile tailnet={tailnet} delay={0.25} />
    </section>
  )
}
