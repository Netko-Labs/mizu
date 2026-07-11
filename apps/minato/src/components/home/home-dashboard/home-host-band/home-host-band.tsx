import { motion } from 'motion/react'
import { Skeleton } from '@/components/ui/skeleton'
import type { HomeHostBandProps } from '../lib/types'

export function HomeHostBand({ host, isLoading }: HomeHostBandProps) {
  if (isLoading || !host) {
    return (
      <Skeleton className="mb-6 h-[74px] rounded-lg border border-neutral-800 bg-neutral-950" />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-lg border border-neutral-800 bg-neutral-950 p-4"
    >
      <div className="min-w-0">
        <div className="truncate text-lg font-medium leading-tight text-white">{host.hostname}</div>
        <div className="mt-0.5 text-[11px] text-neutral-500">{host.osLine}</div>
      </div>
      <div className="flex items-center gap-4 text-[11px]">
        <span className={host.runtimeAvailable ? 'text-emerald-500' : 'text-neutral-600'}>
          {host.runtimeAvailable ? '●' : '○'}
          <span className="ml-1.5">runtime</span>
        </span>
        {host.tailnetDnsName ? (
          <span className="text-blue-400">
            ●<span className="ml-1.5">{host.tailnetDnsName}</span>
          </span>
        ) : (
          <span className="text-neutral-600">
            ○<span className="ml-1.5">tailnet</span>
          </span>
        )}
      </div>
    </motion.div>
  )
}
