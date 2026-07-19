import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function BaseNode({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'relative rounded-xl border border-border bg-card text-foreground/80 shadow-lg shadow-black/50',
        'transition-all duration-200',
        'hover:border-blue-500/20 hover:shadow-xl hover:shadow-blue-950/20',
        '[.react-flow\\_\\_node.selected_&]:border-blue-500/30',
        '[.react-flow\\_\\_node.selected_&]:shadow-xl',
        '[.react-flow\\_\\_node.selected_&]:shadow-blue-950/30',
        className,
      )}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: React Flow nodes need tabIndex for keyboard navigation
      tabIndex={0}
      {...props}
    />
  )
}

/**
 * A container for a consistent header layout intended to be used inside the
 * `<BaseNode />` component.
 */
export function BaseNodeHeader({ className, ...props }: ComponentProps<'header'>) {
  return (
    <header
      {...props}
      className={cn('flex flex-row items-center gap-3 px-4 pt-3.5 pb-1', className)}
    />
  )
}

/**
 * The title text for the node. To maintain a native application feel, the title
 * text is not selectable.
 */
export function BaseNodeHeaderTitle({ className, ...props }: ComponentProps<'h3'>) {
  return (
    <h3
      data-slot="base-node-title"
      className={cn('user-select-none flex-1 text-[13px] font-semibold text-white', className)}
      {...props}
    />
  )
}

export function BaseNodeContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="base-node-content"
      className={cn('flex flex-col gap-y-2.5 px-4 pb-3.5 pt-1', className)}
      {...props}
    />
  )
}

export function BaseNodeFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="base-node-footer"
      className={cn(
        'flex flex-col items-center gap-y-2 border-t border-blue-500/10 px-4 pt-2.5 pb-3',
        className,
      )}
      {...props}
    />
  )
}
