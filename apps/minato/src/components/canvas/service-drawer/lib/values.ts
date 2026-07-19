import type { DatabaseStatus, DatabaseType, ServiceStatus } from '@mizu/nagare-domain'
import {
  IconAdjustments,
  IconChartLine,
  IconHistory,
  IconLayoutDashboard,
  IconTerminal2,
  IconVariable,
} from '@tabler/icons-react'
import type { StatusMeta, TabDefinition } from './types'

export const TAB_DEFINITIONS: TabDefinition[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: IconLayoutDashboard,
    appliesTo: ['service', 'database'],
    implemented: true,
  },
  {
    id: 'deployments',
    label: 'Deployments',
    icon: IconHistory,
    appliesTo: ['service'],
    implemented: false,
  },
  {
    id: 'variables',
    label: 'Variables',
    icon: IconVariable,
    appliesTo: ['service'],
    implemented: false,
  },
  {
    id: 'metrics',
    label: 'Metrics',
    icon: IconChartLine,
    appliesTo: ['service'],
    implemented: false,
  },
  {
    id: 'logs',
    label: 'Logs',
    icon: IconTerminal2,
    appliesTo: ['service', 'database'],
    implemented: false,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: IconAdjustments,
    appliesTo: ['service', 'database'],
    implemented: true,
  },
]

export const SERVICE_STATUS_META: Record<ServiceStatus, StatusMeta> = {
  created: { label: 'Idle', color: 'text-neutral-500', dot: 'bg-neutral-500' },
  building: { label: 'Building', color: 'text-blue-400', dot: 'bg-blue-400 animate-pulse' },
  starting: { label: 'Starting', color: 'text-amber-400', dot: 'bg-amber-400 animate-pulse' },
  running: { label: 'Online', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  stopping: { label: 'Stopping', color: 'text-amber-400', dot: 'bg-amber-400 animate-pulse' },
  stopped: { label: 'Offline', color: 'text-neutral-500', dot: 'bg-neutral-500' },
  error: { label: 'Error', color: 'text-red-400', dot: 'bg-red-400' },
}

export const DATABASE_STATUS_META: Record<DatabaseStatus, StatusMeta> = {
  created: { label: 'Idle', color: 'text-neutral-500', dot: 'bg-neutral-500' },
  starting: { label: 'Starting', color: 'text-amber-400', dot: 'bg-amber-400 animate-pulse' },
  running: { label: 'Online', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  stopping: { label: 'Stopping', color: 'text-amber-400', dot: 'bg-amber-400 animate-pulse' },
  stopped: { label: 'Offline', color: 'text-neutral-500', dot: 'bg-neutral-500' },
  error: { label: 'Error', color: 'text-red-400', dot: 'bg-red-400' },
}

export const DATABASE_TYPE_LABELS: Record<DatabaseType, string> = {
  postgres: 'PostgreSQL',
  mysql: 'MySQL',
  redis: 'Redis',
  mongodb: 'MongoDB',
  mariadb: 'MariaDB',
}
