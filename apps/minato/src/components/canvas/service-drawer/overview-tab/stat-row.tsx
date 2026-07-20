import type { ServiceSourceType, ServiceStatus } from '@mizu/nagare-domain'
import { formatRelativeTime } from '@/components/canvas/lib'
import { formatCompactDuration, SERVICE_STATUS_META } from '../lib'
import { StatTile } from '../shared'
import type { OverviewStatRowProps } from './lib'

/** The four-up glance row: status, image, last activity, exposure. */
export function OverviewStatRow({ service, exposed, hasIngress }: OverviewStatRowProps) {
  const status = SERVICE_STATUS_META[(service.status ?? 'created') as ServiceStatus]
  const sourceType = service.sourceType as ServiceSourceType
  const sourceConfig = (service.sourceConfig ?? {}) as Record<string, unknown>
  const image =
    sourceType === 'image'
      ? `${(sourceConfig.image as string) ?? '?'}:${(sourceConfig.tag as string) ?? 'latest'}`
      : sourceType === 'git'
        ? ((sourceConfig.repository as string) ?? 'not set')
        : ((sourceConfig.templateId as string) ?? 'not set')
  const running = service.status === 'running'
  const exposure = exposed ? 'Public' : hasIngress ? 'Ingress rules' : 'Private'

  return (
    <div className="grid grid-cols-2 gap-2">
      <StatTile label="Status" value={status.label} dot={status.dot} />
      <StatTile label="Image" value={image} mono />
      <StatTile
        label={running ? 'Uptime' : 'Last deploy'}
        value={running ? `up ${formatCompactDuration(service.updatedAt)}` : '—'}
        sub={running ? undefined : `updated ${formatRelativeTime(service.updatedAt)}`}
      />
      <StatTile label="Exposure" value={exposure} />
    </div>
  )
}
