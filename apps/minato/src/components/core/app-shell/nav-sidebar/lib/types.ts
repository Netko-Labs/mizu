import type { Icon } from '@tabler/icons-react'

export interface NavigationItem {
  title: string
  to: string
  icon: Icon
  cmd: string
}

export interface NavItemProps {
  to: string
  icon: Icon
  title: string
  cmd: string
}

export interface MizuBrandProps {
  collapsed: boolean
}
