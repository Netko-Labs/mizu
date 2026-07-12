import { IconLogout, IconSettings } from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useSidebar } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { signOut, useSession } from '@/integrations/auth/client'
import { cn } from '@/lib/utils'

const ICON_BUTTON_CLASS = cn(
  'flex size-6 shrink-0 items-center justify-center rounded-md text-neutral-500',
  'outline-none transition-colors hover:bg-neutral-900 hover:text-neutral-300',
  'focus-visible:ring-2 focus-visible:ring-blue-500/40',
)

export function UserMenu() {
  const { data: session, isPending } = useSession()
  const { state } = useSidebar()
  const navigate = useNavigate()
  const collapsed = state === 'collapsed'

  const user = session?.user
  const initial = (user?.name?.[0] || user?.email?.[0] || '?').toUpperCase()

  if (isPending) {
    return (
      <div
        className={cn(
          'flex items-center font-mono',
          collapsed ? 'justify-center' : 'h-11 gap-2 px-3',
        )}
      >
        <div className="size-6 animate-pulse rounded-md bg-neutral-800" />
        {!collapsed && (
          <div className="flex-1 space-y-1">
            <div className="h-2.5 w-16 animate-pulse rounded bg-neutral-800" />
            <div className="h-2 w-24 animate-pulse rounded bg-neutral-800" />
          </div>
        )}
      </div>
    )
  }

  const handleSignOut = () =>
    signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: '/login' })
        },
      },
    })

  const avatar = (
    <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-neutral-900 bg-neutral-950 text-[10px] text-neutral-400">
      {initial}
    </div>
  )

  const actions = (
    <>
      <Tooltip>
        <TooltipTrigger
          render={<Link to="/settings" aria-label="Settings" className={ICON_BUTTON_CLASS} />}
        >
          <IconSettings className="size-4" strokeWidth={1.5} />
        </TooltipTrigger>
        <TooltipContent side={collapsed ? 'right' : 'top'} className="font-mono text-[10px]">
          config
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger onClick={handleSignOut} aria-label="Sign out" className={ICON_BUTTON_CLASS}>
          <IconLogout className="size-4" strokeWidth={1.5} />
        </TooltipTrigger>
        <TooltipContent side={collapsed ? 'right' : 'top'} className="font-mono text-[10px]">
          exit
        </TooltipContent>
      </Tooltip>
    </>
  )

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1 font-mono">
        {avatar}
        {actions}
      </div>
    )
  }

  return (
    <div className="flex h-11 items-center gap-2 px-3 font-mono">
      {avatar}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[11px] leading-4 text-neutral-300">
          {user?.name || 'user'}
        </span>
        <span className="truncate text-[10px] leading-4 text-neutral-600">
          {user?.email || '@local'}
        </span>
      </div>
      {actions}
    </div>
  )
}
