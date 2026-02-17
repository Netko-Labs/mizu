import type { ReactNode } from 'react'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { MidnightAuroraSidebar } from './sidebars'

interface AppShellProps {
  children: ReactNode
  /** Optional title to display in the header */
  title?: string
  /** Optional breadcrumb or additional header content */
  headerContent?: ReactNode
  /** Optional actions to display on the right side of the header */
  headerActions?: ReactNode
  /** Whether to show the header (default: true) */
  showHeader?: boolean
  /** Additional className for the main content area */
  contentClassName?: string
}

export function AppShell({
  children,
  title,
  headerContent,
  headerActions,
  showHeader = true,
  contentClassName,
}: AppShellProps) {
  return (
    <SidebarProvider>
      <MidnightAuroraSidebar />
      <SidebarInset>
        {showHeader && (
          <header
            className={cn(
              'sticky top-0 z-10',
              'flex h-12 shrink-0 items-center gap-2 border-b border-neutral-800',
              'bg-black/80 font-mono backdrop-blur-sm',
            )}
          >
            {/* Left section: Sidebar trigger + title/breadcrumb */}
            <div className="flex flex-1 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1 text-neutral-600 hover:text-neutral-400" />
              <Separator
                orientation="vertical"
                className="mr-2 h-4 bg-neutral-800 data-[orientation=vertical]:w-px"
              />

              {/* Title or custom header content */}
              {headerContent ||
                (title && <h1 className="text-xs font-medium text-neutral-400">{title}</h1>)}
            </div>

            {/* Right section: Actions */}
            {headerActions && <div className="flex items-center gap-2 px-4">{headerActions}</div>}
          </header>
        )}

        {/* Main content area */}
        <main className={cn('flex-1', contentClassName)}>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
