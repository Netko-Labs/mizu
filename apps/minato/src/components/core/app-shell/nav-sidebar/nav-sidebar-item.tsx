import { Link, useRouterState } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import type { NavItemProps } from './lib/types'

export function NavItem({ to, icon: Icon, title, cmd }: NavItemProps) {
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
