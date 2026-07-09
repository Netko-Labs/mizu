import { IconPlayerPlay, IconPlayerStop, IconRefresh, IconRocket } from '@tabler/icons-react'
import type { AddDatabaseParams, AddServiceParams, NodeLifecycleAction } from './types'

export const NODE_LIFECYCLE_ACTIONS: NodeLifecycleAction[] = [
  { label: 'Deploy', icon: IconRocket, actionType: 'deploy' },
  { label: 'Start', icon: IconPlayerPlay, actionType: 'start' },
  { label: 'Stop', icon: IconPlayerStop, actionType: 'stop' },
  { label: 'Restart', icon: IconRefresh, actionType: 'restart' },
]

export const NEW_SERVICE_PRESET: AddServiceParams = {
  name: 'New Service',
  sourceType: 'image',
  sourceConfig: { image: 'nginx', tag: 'latest' },
}

export const NEW_DATABASE_PRESET: AddDatabaseParams = {
  name: 'New Database',
  type: 'postgres',
  version: '16',
}
