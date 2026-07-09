import { IconChevronDown, IconLogout, IconSettings, IconUser } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSidebar } from '@/components/ui/sidebar'
import { signOut, useSession } from '@/integrations/auth/client'
import { cn } from '@/lib/utils'

export function UserMenu() {
  const { data: session, isPending } = useSession()
  const { state } = useSidebar()
  const navigate = useNavigate()
  const collapsed = state === 'collapsed'

  const user = session?.user
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || '?'

  if (isPending) {
    return (
      <div
        className={cn(
          'flex items-center font-mono',
          collapsed
            ? 'justify-center p-1'
            : 'gap-3 rounded-lg border border-neutral-800 bg-black p-2',
        )}
      >
        <div className="size-8 animate-pulse rounded-lg bg-neutral-800" />
        {!collapsed && (
          <div className="flex-1 space-y-1">
            <div className="h-3 w-16 animate-pulse rounded bg-neutral-800" />
            <div className="h-2 w-12 animate-pulse rounded bg-neutral-800" />
          </div>
        )}
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex w-full items-center font-mono outline-none transition-all duration-200',
          collapsed
            ? 'justify-center rounded-md p-1 hover:bg-neutral-900'
            : 'gap-3 rounded-lg border border-neutral-800 bg-black p-2 hover:border-neutral-700 hover:bg-neutral-950',
        )}
      >
        <Avatar size="default" className="shrink-0 rounded-lg ring-1 ring-neutral-800">
          <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
          <AvatarFallback className="rounded-lg bg-neutral-800 font-mono text-[10px] text-neutral-400">
            {initials}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <div className="flex min-w-0 flex-1 flex-col items-start text-left">
              <span className="w-full truncate text-xs text-neutral-300">
                {user?.name || 'user'}
              </span>
              <span className="w-full truncate text-[10px] text-neutral-600">@local</span>
            </div>
            <IconChevronDown className="size-3 shrink-0 text-neutral-600" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={collapsed ? 'right' : 'top'}
        align="end"
        sideOffset={8}
        className="w-56 rounded-lg border-neutral-800 bg-black font-mono"
      >
        <div className="border-b border-neutral-800 px-2 py-1.5">
          <p className="truncate text-xs text-neutral-300">{user?.name || 'user'}</p>
          <p className="truncate text-[10px] text-neutral-600">{user?.email}</p>
        </div>
        <DropdownMenuItem
          onClick={() => navigate({ to: '/whoami' })}
          className="text-xs text-neutral-500 focus:bg-neutral-950 focus:text-neutral-300"
        >
          <IconUser className="mr-2 size-3" />
          whoami
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate({ to: '/settings' })}
          className="text-xs text-neutral-500 focus:bg-neutral-950 focus:text-neutral-300"
        >
          <IconSettings className="mr-2 size-3" />
          config
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-neutral-800" />
        <DropdownMenuItem
          onClick={() =>
            signOut({
              fetchOptions: {
                onSuccess: () => {
                  navigate({ to: '/login' })
                },
              },
            })
          }
          className="text-xs text-red-500 focus:bg-red-500/10 focus:text-red-400"
        >
          <IconLogout className="mr-2 size-3" />
          exit
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
