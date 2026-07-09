import { IconChevronsLeft, IconDroplet } from '@tabler/icons-react'
import { motion } from 'motion/react'
import { useSidebar } from '@/components/ui/sidebar'
import type { MizuBrandProps } from './lib/types'

export function MizuBrand({ collapsed }: MizuBrandProps) {
  const { toggleSidebar } = useSidebar()

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={toggleSidebar}
        className="flex w-full items-center justify-center"
      >
        <motion.div
          className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-black font-mono"
          whileHover={{ borderColor: 'rgba(59, 130, 246, 0.5)' }}
        >
          <IconDroplet className="h-4 w-4 text-blue-500" strokeWidth={2} />
        </motion.div>
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <motion.div
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-800 bg-black font-mono"
        whileHover={{ borderColor: 'rgba(59, 130, 246, 0.5)' }}
      >
        <IconDroplet className="h-5 w-5 text-blue-500" strokeWidth={2} />
      </motion.div>
      <div className="min-w-0 flex-1 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">mizu</span>
          <motion.span
            className="text-neutral-600"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
          >
            _
          </motion.span>
        </div>
        <div className="rounded border border-neutral-800 bg-black px-1.5 py-0.5 text-[9px] text-neutral-500">
          v0.1.0-alpha
        </div>
      </div>
      <button
        type="button"
        onClick={toggleSidebar}
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-neutral-700 transition-colors hover:bg-neutral-900 hover:text-neutral-400"
      >
        <IconChevronsLeft className="size-3.5" strokeWidth={1.5} />
      </button>
    </div>
  )
}
