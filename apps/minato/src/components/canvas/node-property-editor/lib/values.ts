import type { DatabaseStatus, DatabaseType, ServiceStatus } from '@mizu/nagare-domain'

export const serviceStatusColors: Record<ServiceStatus, string> = {
  created: 'text-neutral-500',
  building: 'text-amber-500',
  starting: 'text-yellow-500',
  running: 'text-emerald-500',
  stopping: 'text-yellow-500',
  stopped: 'text-neutral-500',
  error: 'text-red-500',
}

export const dbStatusColors: Record<DatabaseStatus, string> = {
  created: 'text-neutral-500',
  starting: 'text-yellow-500',
  running: 'text-emerald-500',
  stopping: 'text-yellow-500',
  stopped: 'text-neutral-500',
  error: 'text-red-500',
}

export const databaseTypeLabels: Record<DatabaseType, string> = {
  postgres: 'PostgreSQL',
  mysql: 'MySQL',
  redis: 'Redis',
  mongodb: 'MongoDB',
  mariadb: 'MariaDB',
}
