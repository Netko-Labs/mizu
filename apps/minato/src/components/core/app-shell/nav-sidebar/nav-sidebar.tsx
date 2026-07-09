import {
  IconChevronDown,
  IconChevronsLeft,
  IconCommand,
  IconDroplet,
  IconFolder,
  IconHome,
  IconLogout,
  IconSettings,
  IconUser,
} from '@tabler/icons-react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useCommandPalette } from '@/components/command-palette'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { WorkspaceSwitcher } from '@/components/workspaces/workspace-switcher'
import { signOut, useSession } from '@/integrations/auth/client'
import { cn } from '@/lib/utils'

const navigationItems = [
  { title: 'home', to: '/home', icon: IconHome, cmd: '~' },
  { title: 'projects', to: '/projects', icon: IconFolder, cmd: 'ls' },
  { title: 'config', to: '/settings', icon: IconSettings, cmd: 'cfg' },
] as const

function MizuBrand({ collapsed }: { collapsed: boolean }) {
  const { toggleSidebar } = useSidebar()

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={toggleSidebar}
        className="flex w-full items-center justify-center"
      >
        <motion.div
          className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-black font-mono"
          whileHover={{ borderColor: 'rgba(59, 130, 246, 0.5)' }}
        >
          <IconDroplet className="h-4 w-4 text-blue-500" strokeWidth={2} />
        </motion.div>
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <motion.div
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-800 bg-black font-mono"
        whileHover={{ borderColor: 'rgba(59, 130, 246, 0.5)' }}
      >
        <IconDroplet className="h-5 w-5 text-blue-500" strokeWidth={2} />
      </motion.div>
      <div className="min-w-0 flex-1 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">mizu</span>
          <motion.span
            className="text-neutral-600"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
          >
            _
          </motion.span>
        </div>
        <div className="rounded border border-neutral-800 bg-black px-1.5 py-0.5 text-[9px] text-neutral-500">
          v0.1.0-alpha
        </div>
      </div>
      <button
        type="button"
        onClick={toggleSidebar}
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-neutral-700 transition-colors hover:bg-neutral-900 hover:text-neutral-400"
      >
        <IconChevronsLeft className="size-3.5" strokeWidth={1.5} />
      </button>
    </div>
  )
}

function NavItem({
  to,
  icon: Icon,
  title,
  cmd,
}: {
  to: string
  icon: typeof IconFolder
  title: string
  cmd: string
}) {
  const routerState = useRouterState()
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'
  const isActive =
    routerState.location.pathname === to ||
    (to !== '/' && routerState.location.pathname.startsWith(`${to}/`))

  return (
    <SidebarMenuItem>
      <Link to={to}>
        <SidebarMenuButton
          isActive={isActive}
          tooltip={title}
          className={cn(
            'relative rounded-lg font-mono transition-all duration-200',
            isActive
              ? 'bg-neutral-950 text-white'
              : 'text-neutral-500 hover:bg-neutral-950 hover:text-neutral-300',
          )}
        >
          {!collapsed && <span className="mr-1 text-neutral-700">$</span>}
          <Icon
            className={cn('size-4', isActive ? 'text-blue-500' : 'text-neutral-600')}
            strokeWidth={1.5}
          />
          <span className="text-xs">{title}</span>
          {!collapsed && <span className="ml-auto text-[10px] text-neutral-700">{cmd}</span>}
          {isActive && (
            <motion.div
              layoutId="nav-indicator"
              className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-blue-500"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  )
}

function UserMenu() {
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

function CommandPaletteButton() {
  const { open } = useCommandPalette()
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={open}
        tooltip="Command Palette (⌘K)"
        className="rounded-lg font-mono text-xs text-neutral-500 transition-all hover:bg-neutral-950 hover:text-neutral-300"
      >
        {!collapsed && <span className="mr-1 text-neutral-700">$</span>}
        <IconCommand className="size-4 text-neutral-600" strokeWidth={1.5} />
        <span>cmd</span>
        {!collapsed && (
          <kbd className="ml-auto rounded border border-neutral-800 bg-black px-1 py-0.5 text-[10px] text-neutral-600">
            ⌘K
          </kbd>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function NavSidebar() {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="border-r border-neutral-800 bg-black font-mono"
    >
      <SidebarHeader className={cn('relative', collapsed ? 'px-2 py-3' : 'px-4 py-4')}>
        <MizuBrand collapsed={collapsed} />
      </SidebarHeader>

      <div className={cn(collapsed ? 'px-1.5 pb-2' : 'px-3 pb-3')}>
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      {!collapsed && <div className="mx-3 h-px bg-neutral-800" />}

      <SidebarContent className="relative">
        <SidebarGroup className={cn(collapsed ? 'py-2' : 'py-3')}>
          {!collapsed && <div className="mb-2 px-4 text-[10px] text-neutral-700"># quick</div>}
          <SidebarGroupContent>
            <SidebarMenu className={cn('space-y-1', collapsed ? 'px-1' : 'px-2')}>
              <CommandPaletteButton />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && <div className="mx-3 h-px bg-neutral-800" />}

        <SidebarGroup className={cn(collapsed ? 'py-2' : 'py-3')}>
          {!collapsed && <div className="mb-2 px-4 text-[10px] text-neutral-700"># navigation</div>}
          <SidebarGroupContent>
            <SidebarMenu className={cn('space-y-1', collapsed ? 'px-1' : 'px-2')}>
              {navigationItems.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && <div className="mx-3 h-px bg-neutral-800" />}

      <SidebarFooter className={cn('relative', collapsed ? 'p-1.5' : 'p-3')}>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
