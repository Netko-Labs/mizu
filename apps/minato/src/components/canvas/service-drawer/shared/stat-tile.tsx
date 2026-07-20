import { cn } from '@/lib/utils'
import type { StatTileProps } from './lib'

/**
 * A single dashboard stat: a tiny muted label over a big value with an
 * optional sub-line. Becomes a button when `onClick` is provided.
 */
export function StatTile({ label, value, sub, dot, mono, onClick }: StatTileProps) {
  const Wrapper = onClick ? 'button' : 'div'
  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex min-w-0 flex-col gap-1 rounded-lg border border-border bg-background/40 px-3 py-2.5 text-left',
        onClick && 'transition-colors hover:border-foreground/20 hover:bg-background/70',
      )}
    >
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="flex min-w-0 items-center gap-1.5">
        {dot && <span className={cn('inline-block size-1.5 shrink-0 rounded-full', dot)} />}
        <span
          className={cn(
            'min-w-0 truncate text-sm font-semibold text-foreground',
            mono && 'font-mono text-xs',
          )}
        >
          {value}
        </span>
      </span>
      {sub && <span className="truncate text-[10px] text-muted-foreground">{sub}</span>}
    </Wrapper>
  )
}
