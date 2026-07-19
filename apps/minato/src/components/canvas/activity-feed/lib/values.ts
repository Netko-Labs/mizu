import type { ActivityType } from '@mizu/nagare-domain'
import {
  type Icon,
  IconPencil,
  IconPlayerPlay,
  IconPlayerStop,
  IconPlus,
  IconRefresh,
  IconRocket,
  IconRotateClockwise2,
  IconTrash,
  IconVariable,
} from '@tabler/icons-react'

interface ActivityMeta {
  icon: Icon
  /** Verb phrase after the entity name: "web deployed". */
  verb: string
  color: string
}

export const ACTIVITY_META: Record<ActivityType, ActivityMeta> = {
  'service.create': { icon: IconPlus, verb: 'created', color: 'text-emerald-400' },
  'service.update': { icon: IconPencil, verb: 'updated', color: 'text-muted-foreground' },
  'service.delete': { icon: IconTrash, verb: 'deleted', color: 'text-red-400' },
  'service.deploy': { icon: IconRocket, verb: 'deployed', color: 'text-primary' },
  'service.start': { icon: IconPlayerPlay, verb: 'started', color: 'text-emerald-400' },
  'service.stop': { icon: IconPlayerStop, verb: 'stopped', color: 'text-amber-400' },
  'service.restart': { icon: IconRefresh, verb: 'restarted', color: 'text-primary' },
  'service.rollback': {
    icon: IconRotateClockwise2,
    verb: 'rolled back',
    color: 'text-amber-400',
  },
  'service.env-update': { icon: IconVariable, verb: 'variables updated', color: 'text-primary' },
  'database.create': { icon: IconPlus, verb: 'created', color: 'text-emerald-400' },
  'database.update': { icon: IconPencil, verb: 'updated', color: 'text-muted-foreground' },
  'database.delete': { icon: IconTrash, verb: 'deleted', color: 'text-red-400' },
  'database.deploy': { icon: IconRocket, verb: 'deployed', color: 'text-primary' },
  'database.start': { icon: IconPlayerPlay, verb: 'started', color: 'text-emerald-400' },
  'database.stop': { icon: IconPlayerStop, verb: 'stopped', color: 'text-amber-400' },
  'project.update': { icon: IconPencil, verb: 'settings updated', color: 'text-muted-foreground' },
}

export const ACTIVITY_POLL_MS = 10_000
