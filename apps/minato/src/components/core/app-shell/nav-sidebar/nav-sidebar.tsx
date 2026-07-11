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
import { FOOTER_NAVIGATION_ITEMS, NAVIGATION_ITEMS } from './lib'
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
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="border-r border-neutral-800 bg-black font-mono"
    >
      <SidebarHeader
        className={cn(
          'border-b border-neutral-800/60',
          collapsed ? 'gap-1 px-1 py-2' : 'gap-0 p-0',
        )}
      >
        <MizuBrand collapsed={collapsed} />
        <WorkspaceSwitcher collapsed={collapsed} />
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

      <SidebarFooter
        className={cn('border-t border-neutral-800/60', collapsed ? 'gap-1 p-1' : 'gap-1 p-2')}
      >
        <SidebarMenu className="gap-0.5">
          {FOOTER_NAVIGATION_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </SidebarMenu>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
