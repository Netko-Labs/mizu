import type { DrawerSectionProps } from './lib'

/**
 * A denser titled section — the drawer's answer to a bare `Card`. Consistent
 * padding, a subtle bordered surface, and an optional header action keep every
 * tab on the same rhythm.
 */
export function DrawerSection({ title, description, action, children }: DrawerSectionProps) {
  return (
    <section className="rounded-lg border border-border bg-card/40">
      <header className="flex items-start justify-between gap-2 border-b border-border px-3 py-2">
        <div className="min-w-0">
          <h3 className="text-xs font-medium text-foreground">{title}</h3>
          {description && (
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <div className="p-3">{children}</div>
    </section>
  )
}
