import { IconX } from '@tabler/icons-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { ActivityFeedItem } from './activity-feed-item'
import { useProjectActivity } from './lib'
import type { ActivityFeedProps } from './lib/types'

/** Railway-style right-side project event trail, grouped by day. */
export function ActivityFeed({ projectId, onClose }: ActivityFeedProps) {
  const { groups, isLoading } = useProjectActivity(projectId)

  return (
    <div className="flex h-full flex-col">
      {onClose && (
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <span className="text-xs font-medium text-foreground">Activity</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close activity"
          >
            <IconX className="size-3" />
          </button>
        </div>
      )}
      <ScrollArea className="min-h-0 flex-1">
        {isLoading && (
          <div className="flex items-center gap-2 px-3 py-6 text-xs text-muted-foreground">
            <Spinner className="size-3" /> Loading activity…
          </div>
        )}
        {!isLoading && groups.length === 0 && (
          <div className="px-3 py-8 text-center text-xs text-muted-foreground">
            Nothing yet — deploys and edits show up here.
          </div>
        )}
        {groups.map((group) => (
          <div key={group.label}>
            <div className="sticky top-0 bg-card/95 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground backdrop-blur-sm">
              {group.label}
            </div>
            {group.items.map((activity) => (
              <ActivityFeedItem key={activity.id} activity={activity} />
            ))}
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}
