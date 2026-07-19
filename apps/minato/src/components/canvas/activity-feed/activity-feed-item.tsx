import type { ActivityType } from '@mizu/nagare-domain'
import { formatRelativeTime } from '@/components/canvas/lib'
import { cn } from '@/lib/utils'
import type { ActivityFeedItemProps } from './lib/types'
import { ACTIVITY_META } from './lib/values'

/** One feed row: icon, "web deployed", relative time, actor. */
export function ActivityFeedItem({ activity }: ActivityFeedItemProps) {
  const meta = ACTIVITY_META[activity.type as ActivityType] ?? {
    icon: () => null,
    verb: activity.type,
    color: 'text-muted-foreground',
  }
  const MetaIcon = meta.icon

  return (
    <div className="flex items-start gap-2.5 px-3 py-2">
      <span
        className={cn(
          'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-background/80',
          meta.color,
        )}
      >
        <MetaIcon className="size-3" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs">
          <span className="font-medium text-foreground">{activity.entityName}</span>{' '}
          <span className="text-muted-foreground">{meta.verb}</span>
        </div>
        <div className="text-[11px] text-muted-foreground/70">
          {formatRelativeTime(activity.createdAt)}
          {activity.userName ? ` · ${activity.userName}` : ''}
        </div>
      </div>
    </div>
  )
}
