import {
  IconChevronDown,
  IconCommand,
  IconDroplet,
  IconFolder,
  IconHome,
  IconLogout,
  IconSettings,
  IconUser,
} from '@tabler/icons-react'
import { Link, useRouterState } from '@tanstack/react-router'
import { useCommandPalette } from '@/components/command-palette'
import { WorkspaceSwitcher } from '@/components/layout/workspace-switcher'
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
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import { signOut, useSession } from '@/integrations/auth/client'
import { cn } from '@/lib/utils'

const navigationItems = [
  {
    title: 'Home',
    to: '/home',
    icon: IconHome,
  },
  {
    title: 'Projects',
    to: '/projects',
    icon: IconFolder,
  },
  {
    title: 'Settings',
    to: '/settings',
    icon: IconSettings,
  },
] as const

function MizuBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-between')}>
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-mizu-teal shadow-sm">
          <IconDroplet className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
        </div>
        {!collapsed && <span className="text-base font-semibold tracking-tight">Mizu</span>}
      </div>
      {!collapsed && (
        <span className="rounded bg-muted/80 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
          v0.1.0
        </span>
      )}
    </div>
  )
}

function NavItem({
  to,
  icon: Icon,
  title,
}: {
  to: string
  icon: typeof IconFolder
  title: string
}) {
  const routerState = useRouterState()
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
            'relative transition-all duration-200',
            isActive && [
              'bg-muted/60 text-foreground',
              'before:absolute before:inset-y-2 before:left-2 before:w-1',
              'before:rounded-full before:bg-foreground/70',
            ],
          )}
        >
          <Icon
            className={cn(
              'size-[18px] transition-colors',
              isActive ? 'text-foreground' : 'text-muted-foreground',
            )}
          />
          <span className="font-medium">{title}</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  )
}

function UserMenu() {
  const { data: session, isPending } = useSession()
  const { state } = useSidebar()
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

  const handleSignOut = async () => {
    await signOut()
  }

  if (isPending) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-2">
        <div className="size-8 animate-pulse rounded-full bg-muted" />
        {!collapsed && (
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-2 w-16 animate-pulse rounded bg-muted" />
          </div>
        )}
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex w-full items-center gap-3 rounded-lg p-2 outline-none',
          'transition-colors duration-150',
          'hover:bg-muted/50 focus-visible:bg-muted/50',
          'data-[popup-open]:bg-muted/50',
        )}
      >
        <Avatar size="default" className="shrink-0">
          <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
          <AvatarFallback className="bg-foreground/10 text-[11px] font-semibold text-foreground/90">
            {initials}
          </AvatarFallback>
        </Avatar>

        {!collapsed && (
          <>
            <div className="flex min-w-0 flex-1 flex-col items-start text-left">
              <span className="w-full truncate text-sm font-medium text-foreground">
                {user?.name || 'User'}
              </span>
              <span className="w-full truncate text-xs text-muted-foreground">
                {user?.email || 'No email'}
              </span>
            </div>
            <IconChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 [[data-popup-open]_&]:rotate-180" />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side={collapsed ? 'right' : 'top'}
        align={collapsed ? 'start' : 'end'}
        sideOffset={8}
        className="w-56"
      >
        <div className="px-2 py-1.5">
          <p className="truncate text-sm font-medium">{user?.name || 'User'}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email || 'No email'}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <IconUser className="mr-2 size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconSettings className="mr-2 size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} variant="destructive">
          <IconLogout className="mr-2 size-4" />
          Sign out
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
        className="text-muted-foreground hover:text-foreground"
      >
        <IconCommand className="size-[18px]" />
        <span className="font-medium">Command</span>
        {!collapsed && (
          <span className="ml-auto text-[10px] text-muted-foreground/70 font-mono">⌘K</span>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function NavSidebar() {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r border-border/60">
      <SidebarHeader className="px-3 py-3">
        <MizuBrand collapsed={collapsed} />
      </SidebarHeader>

      <div className="px-3 pb-3">
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      <SidebarSeparator className="opacity-50" />

      {/* Main navigation */}
      <SidebarContent>
        {/* Quick actions */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <CommandPaletteButton />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="opacity-40" />

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel
            className={cn(
              'text-[10px] uppercase tracking-[0.32em] text-muted-foreground/60',
              collapsed && 'sr-only',
            )}
          >
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <NavItem key={item.to} to={item.to} icon={item.icon} title={item.title} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="opacity-40" />

      {/* Footer with user menu */}
      <SidebarFooter className="p-3">
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
