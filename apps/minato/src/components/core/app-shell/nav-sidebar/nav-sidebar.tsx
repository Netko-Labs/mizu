import { IconChevronsLeft, IconCommand } from '@tabler/icons-react'
import { useCommandPalette } from '@/components/command-palette'
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
import { cn } from '@/lib/utils'
import { NAVIGATION_ITEMS } from './lib'
import { MizuBrand } from './nav-sidebar-brand'
import { NavItem } from './nav-sidebar-item'
import { UserMenu } from './nav-sidebar-user-menu'

function CommandPaletteButton() {
  const { open } = useCommandPalette()
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={open}
        tooltip="Command Palette (⌘K)"
        className={cn(
          'h-8 rounded-md font-mono text-xs text-neutral-500 transition-colors duration-200',
          'hover:bg-neutral-950 hover:text-neutral-300',
          'focus-visible:ring-2 focus-visible:ring-blue-500/40',
        )}
      >
        <IconCommand className="size-4 text-neutral-600" strokeWidth={1.5} />
        <span className="text-xs">cmd</span>
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
  const { state, toggleSidebar } = useSidebar()
  const collapsed = state === 'collapsed'

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="border-r border-neutral-800 bg-black font-mono"
    >
      <SidebarHeader
        className={cn('border-b border-neutral-800/60', collapsed ? 'px-1 py-2' : 'p-0')}
      >
        {collapsed ? (
          <WorkspaceSwitcher collapsed />
        ) : (
          <div className="flex h-11 items-center gap-1.5 px-3 font-mono">
            <MizuBrand />
            <span className="text-xs leading-none text-neutral-700">/</span>
            <WorkspaceSwitcher collapsed={false} />
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
              className="ml-auto flex size-6 shrink-0 items-center justify-center rounded-md text-neutral-700 outline-none transition-colors hover:bg-neutral-900 hover:text-neutral-400 focus-visible:ring-2 focus-visible:ring-blue-500/40"
            >
              <IconChevronsLeft className="size-3.5" strokeWidth={1.5} />
            </button>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className={cn('py-2', collapsed ? 'px-1' : 'px-2')}>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {NAVIGATION_ITEMS.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
              <CommandPaletteButton />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={cn('border-t border-neutral-800/60', collapsed ? 'p-1' : 'p-0')}>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
