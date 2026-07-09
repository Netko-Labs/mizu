import { IconCommand } from '@tabler/icons-react'
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
              {NAVIGATION_ITEMS.map((item) => (
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
