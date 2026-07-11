import { IconChevronsLeft } from '@tabler/icons-react'
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
        aria-label="Expand sidebar"
        className="mx-auto flex size-8 items-center justify-center rounded-md bg-blue-500/10 font-mono text-sm leading-none text-blue-400 outline-none transition-colors hover:bg-blue-500/20 focus-visible:ring-2 focus-visible:ring-blue-500/40"
      >
        水
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 pt-3 pb-1 font-mono">
      <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-[13px] leading-none text-blue-400">
        水
      </div>
      <span className="text-[13px] font-medium leading-none text-white">mizu</span>
      <motion.span
        className="text-xs leading-none text-neutral-600"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
      >
        _
      </motion.span>
      <span className="rounded border border-neutral-800 px-1 text-[10px] leading-4 text-neutral-600">
        v0.1
      </span>
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Collapse sidebar"
        className="ml-auto flex size-6 shrink-0 items-center justify-center rounded-md text-neutral-700 outline-none transition-colors hover:bg-neutral-900 hover:text-neutral-400 focus-visible:ring-2 focus-visible:ring-blue-500/40"
      >
        <IconChevronsLeft className="size-3.5" strokeWidth={1.5} />
      </button>
    </div>
  )
}
