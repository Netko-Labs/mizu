import { Handle, type HandleProps } from '@xyflow/react'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export type BaseHandleProps = HandleProps

export function BaseHandle({ className, children, ...props }: ComponentProps<typeof Handle>) {
  return (
    <Handle
      {...props}
      className={cn(
        'h-4 w-4 rounded-full border-2 border-blue-400/35 bg-blue-500/45 shadow-[0_0_0_4px_rgba(59,130,246,0.12)] transition-all',
        'hover:border-blue-300/70 hover:bg-blue-300/60 hover:scale-110',
        className,
      )}
    >
      {children}
    </Handle>
  )
}
