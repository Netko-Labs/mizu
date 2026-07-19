import type {
  IngressRule,
  PortMapping,
  ServiceSourceType,
  ServiceStatus,
  VolumeMount,
} from '@mizu/nagare-domain'
import {
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
  IconRocket,
  IconTrash,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { type ServicePropertiesProps, serviceStatusColors, useIngressUrl } from './lib'
import {
  ActionButton,
  EditablePropertyLine,
  PropertyLine,
  SectionHeader,
  SourceTypeIcon,
} from './property-primitives'
import { ServiceIngressEditor } from './service-ingress-editor'

export function ServiceProperties({
  service,
  projectSlug,
  onAction,
  isActionPending,
}: ServicePropertiesProps) {
  const status = service.status as ServiceStatus
  const sourceType = service.sourceType as ServiceSourceType
  const sourceConfig = service.sourceConfig as Record<string, unknown>
  const ports = (service.ports ?? []) as PortMapping[]
  const ingressUrl = useIngressUrl(
    service.name,
    projectSlug,
    service.status === 'running' && ports.length > 0,
  )
  const ingressRules =
    ((service.settings ?? {}) as { ingressRules?: IngressRule[] }).ingressRules ?? []
  const volumes = (service.volumeMounts ?? []) as VolumeMount[]

  const getSourceInfo = (): string => {
    switch (sourceType) {
      case 'image': {
        const image = sourceConfig.image as string
        const tag = sourceConfig.tag as string | undefined
        return tag ? `${image}:${tag}` : (image ?? 'not set')
      }
      case 'git':
        return (sourceConfig.repository as string) ?? 'not set'
      case 'template':
        return (sourceConfig.templateId as string) ?? 'not set'
      default:
        return 'unknown'
    }
  }

  return (
    <div className="space-y-5">
      {/* Identity */}
      <div>
        <SectionHeader title="identity" />
        <div className="space-y-1.5">
          <EditablePropertyLine
            label="name"
            value={service.name}
            onSave={(name) => onAction?.({ type: 'updateName', name })}
          />
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-700">&#x25b8;</span>
            <span className="min-w-[80px] shrink-0 text-neutral-600">status</span>
            <span className={cn('flex items-center gap-1', serviceStatusColors[status])}>
              <span
                className={cn(
                  'inline-block size-1.5 rounded-full bg-current',
                  (status === 'building' || status === 'starting' || status === 'stopping') &&
                    'animate-pulse',
                )}
              />
              {status}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-700">&#x25b8;</span>
            <span className="min-w-[80px] shrink-0 text-neutral-600">source</span>
            <span className="flex items-center gap-1 text-neutral-400">
              <SourceTypeIcon type={sourceType} />
              {sourceType}
            </span>
          </div>
        </div>
      </div>

      {/* Source Config */}
      <div>
        <SectionHeader title="source config" />
        <div className="space-y-1.5">
          {sourceType === 'image' ? (
            <>
              <EditablePropertyLine
                label="image"
                value={(sourceConfig.image as string) ?? ''}
                onSave={(image) =>
                  onAction?.({
                    type: 'updateSourceConfig',
                    sourceConfig: { image, tag: sourceConfig.tag as string | undefined },
                  })
                }
              />
              <EditablePropertyLine
                label="tag"
                value={(sourceConfig.tag as string) ?? 'latest'}
                onSave={(tag) =>
                  onAction?.({
                    type: 'updateSourceConfig',
                    sourceConfig: { image: sourceConfig.image as string, tag },
                  })
                }
              />
            </>
          ) : (
            <PropertyLine label="target" value={getSourceInfo()} mono copyable />
          )}
        </div>
      </div>

      {/* Ports */}
      <div>
        <SectionHeader title="ports" />
        {ports.length === 0 ? (
          <div className="text-[10px] text-neutral-700">no ports configured</div>
        ) : (
          <div className="space-y-1">
            {ports.map((port, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded border border-neutral-800 bg-neutral-950 px-2 py-1 font-mono text-[11px]"
              >
                <span className="text-neutral-400">
                  {port.host ?? 'auto'}:{port.container}
                </span>
                <span className="text-neutral-700">{port.protocol ?? 'tcp'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ingress */}
      <div>
        <SectionHeader title="ingress" />
        <ServiceIngressEditor
          rules={ingressRules}
          ports={ports.map((p) => p.container)}
          running={service.status === 'running'}
          autoUrl={ingressUrl}
          onChange={(rules) => onAction?.({ type: 'updateIngress', ingressRules: rules })}
        />
      </div>

      {/* Volumes */}
      <div>
        <SectionHeader title="volumes" />
        {volumes.length === 0 ? (
          <div className="text-[10px] text-neutral-700">no volumes mounted</div>
        ) : (
          <div className="space-y-1">
            {volumes.map((vol, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded border border-neutral-800 bg-neutral-950 px-2 py-1 font-mono text-[11px] text-neutral-400"
              >
                <span className="truncate text-neutral-600">{vol.volumeId}</span>
                <span className="text-neutral-700">-&gt;</span>
                <span className="truncate">{vol.containerPath}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Container */}
      {service.containerId && (
        <div>
          <SectionHeader title="container" />
          <PropertyLine label="id" value={service.containerId} mono copyable />
        </div>
      )}

      {/* Actions */}
      <div>
        <SectionHeader title="actions" />
        <div className="flex flex-wrap gap-1.5">
          <ActionButton
            label="deploy"
            icon={<IconRocket className="size-3" />}
            onClick={() => onAction?.({ type: 'deploy' })}
            disabled={isActionPending}
          />
          <ActionButton
            label="start"
            icon={<IconPlayerPlay className="size-3" />}
            onClick={() => onAction?.({ type: 'start' })}
            disabled={isActionPending}
          />
          <ActionButton
            label="stop"
            icon={<IconPlayerStop className="size-3" />}
            onClick={() => onAction?.({ type: 'stop' })}
            disabled={isActionPending}
          />
          <ActionButton
            label="restart"
            icon={<IconRefresh className="size-3" />}
            onClick={() => onAction?.({ type: 'restart' })}
            disabled={isActionPending}
          />
          <ActionButton
            label="delete"
            icon={<IconTrash className="size-3" />}
            onClick={() => onAction?.({ type: 'delete' })}
            destructive
            disabled={isActionPending}
          />
        </div>
      </div>
    </div>
  )
}
