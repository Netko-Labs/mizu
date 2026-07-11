import { motion } from 'motion/react'
import { LeaderLine } from '@/components/shared/terminal'
import type { HomeTailnetTileProps } from '../lib/types'

export function HomeTailnetTile({ tailnet, delay = 0 }: HomeTailnetTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-lg border border-neutral-800 bg-neutral-950 p-4"
    >
      <div className="text-[10px] text-neutral-600">tailnet</div>
      {tailnet ? (
        <div className="mt-3 space-y-1.5">
          <LeaderLine label="dns" value={tailnet.dnsName} accent />
          <LeaderLine label="ip" value={tailnet.ip} />
        </div>
      ) : (
        <>
          <div className="mt-1.5 text-lg font-medium leading-none text-neutral-600">—</div>
          <div className="mt-2 text-[10px] text-neutral-600">not connected</div>
        </>
      )}
    </motion.div>
  )
}
