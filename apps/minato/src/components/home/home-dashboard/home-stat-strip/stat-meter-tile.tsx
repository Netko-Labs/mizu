import { motion } from 'motion/react'
import { meterBlocks } from '../lib'
import type { StatMeterTileProps } from '../lib/types'

export function StatMeterTile({ tile, delay = 0 }: StatMeterTileProps) {
  const { filled, empty } = meterBlocks(tile.percent)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-lg border border-neutral-800 bg-neutral-950 p-4"
    >
      <div className="text-[10px] text-neutral-600">{tile.label}</div>
      <div className="mt-1.5 text-lg font-medium leading-none text-white">{tile.value}</div>
      <div aria-hidden className="mt-2 text-xs tracking-tight">
        <span className={tile.toneClass}>{filled}</span>
        <span className="text-neutral-800">{empty}</span>
      </div>
      <div className="mt-2 truncate text-[10px] text-neutral-600">{tile.sub}</div>
    </motion.div>
  )
}
