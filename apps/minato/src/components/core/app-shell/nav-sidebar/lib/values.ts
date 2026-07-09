import { IconFolder, IconHome, IconSettings } from '@tabler/icons-react'
import type { NavigationItem } from './types'

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { title: 'home', to: '/home', icon: IconHome, cmd: '~' },
  { title: 'projects', to: '/projects', icon: IconFolder, cmd: 'ls' },
  { title: 'config', to: '/settings', icon: IconSettings, cmd: 'cfg' },
]
