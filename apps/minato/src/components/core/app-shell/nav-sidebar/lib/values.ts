import { IconFolder, IconHome, IconUser } from '@tabler/icons-react'
import type { NavigationItem } from './types'

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { title: 'home', to: '/home', icon: IconHome, cmd: '~' },
  { title: 'projects', to: '/projects', icon: IconFolder, cmd: 'ls' },
  { title: 'whoami', to: '/whoami', icon: IconUser, cmd: 'id' },
]
