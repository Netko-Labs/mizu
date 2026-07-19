import { LogViewer } from '@/components/canvas/shared'
import type { LogsTabProps } from './lib/types'

/** Thin wrapper: the shared log tail scoped to this drawer's entity. */
export function LogsTab({ nodeType, entityId }: LogsTabProps) {
  return (
    <LogViewer
      serviceId={nodeType === 'service' ? entityId : undefined}
      databaseId={nodeType === 'database' ? entityId : undefined}
      className="h-full"
    />
  )
}
