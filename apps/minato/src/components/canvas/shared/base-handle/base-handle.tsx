import { Handle, type HandleProps, Position } from '@xyflow/react'
import type { ComponentProps, CSSProperties } from 'react'

import { cn } from '@/lib/utils'

export type BaseHandleProps = HandleProps

export function BaseHandle({ className, children, ...props }: ComponentProps<typeof Handle>) {
  const baseStyle = (props.style as CSSProperties | undefined) ?? {}
  const placementStyle: CSSProperties =
    props.position === Position.Left
      ? { left: 0, transform: 'translate(-150%, -50%)' }
      : props.position === Position.Right
        ? { right: 0, transform: 'translate(150%, -50%)' }
        : props.position === Position.Top
          ? { top: 0, transform: 'translate(-50%, -150%)' }
          : props.position === Position.Bottom
            ? { bottom: 0, transform: 'translate(-50%, 150%)' }
            : {}

  return (
    <Handle
      {...props}
      style={{
        ...baseStyle,
        ...placementStyle,
      }}
      className={cn(
        // Keep handles visibly outside the node card and above card surfaces.
        'z-40 h-5 w-5 rounded-full border-2 border-blue-100/90 bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.22),0_0_14px_rgba(59,130,246,0.75)] transition-all',
        'before:absolute before:inset-[4px] before:rounded-full before:bg-white/90 before:content-[""]',
        'hover:scale-110 hover:border-white hover:shadow-[0_0_0_5px_rgba(59,130,246,0.3),0_0_18px_rgba(59,130,246,0.95)]',
        className,
      )}
    >
      {children}
    </Handle>
  )
}
