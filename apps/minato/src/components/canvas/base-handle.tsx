import { Handle, type HandleProps } from '@xyflow/react'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export type BaseHandleProps = HandleProps

export function BaseHandle({ className, children, ...props }: ComponentProps<typeof Handle>) {
  return (
    <Handle
      {...props}
      className={cn(
        'h-2.5 w-2.5 rounded-full border-2 border-blue-500/20 bg-blue-500/30 transition-all',
        'hover:border-blue-400/50 hover:bg-blue-400/40 hover:scale-125',
        className,
      )}
    >
      {children}
    </Handle>
  )
}
