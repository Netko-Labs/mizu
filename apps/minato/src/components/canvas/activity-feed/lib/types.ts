import type { Activity } from '@mizu/nagare-domain'
import type { Serialized } from '@/shared/api'

export interface ActivityFeedProps {
  projectId: string
  /** Renders the panel header with a close button; omit when embedded. */
  onClose?: () => void
}

export interface ActivityFeedItemProps {
  activity: Serialized<Activity>
}

export interface ActivityDayGroup {
  /** Localized day label ("Today", "Yesterday", or a date). */
  label: string
  items: Serialized<Activity>[]
}

export interface UseProjectActivityResult {
  groups: ActivityDayGroup[]
  isLoading: boolean
}
