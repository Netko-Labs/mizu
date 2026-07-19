import type { IngressRule, PortMapping, ServiceSourceType, VolumeMount } from '@mizu/nagare-domain'
import { EditablePropertyLine, PropertyLine, SourceTypeIcon } from '@/components/canvas/shared'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type OverviewTabProps, useIngressUrl } from './lib'
import { ServiceIngressEditor } from './service-ingress-editor'

/** Service Overview: Source / Networking / Volumes / Container cards. */
export function OverviewTab({ service, projectSlug, onAction }: OverviewTabProps) {
  const sourceType = service.sourceType as ServiceSourceType
  const sourceConfig = service.sourceConfig as Record<string, unknown>
  const ports = (service.ports ?? []) as PortMapping[]
  const volumes = (service.volumeMounts ?? []) as VolumeMount[]
  const persistentVolumes = (sourceConfig.volumes as string[] | undefined) ?? []
  const ingressRules =
    ((service.settings ?? {}) as { ingressRules?: IngressRule[] }).ingressRules ?? []
  const ingressUrl = useIngressUrl(
    service.name,
    projectSlug,
    service.status === 'running' && ports.length > 0,
  )

  const sourceTarget =
    sourceType === 'git'
      ? ((sourceConfig.repository as string) ?? 'not set')
      : ((sourceConfig.templateId as string) ?? 'not set')

  return (
    <div className="space-y-4 p-4">
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <SourceTypeIcon type={sourceType} />
            Source
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
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
            <PropertyLine label="target" value={sourceTarget} mono copyable />
          )}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-sm">Networking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ports.length === 0 ? (
            <div className="text-[11px] text-muted-foreground">No ports configured</div>
          ) : (
            <div className="space-y-1">
              {ports.map((port, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md border border-border bg-background/60 px-2 py-1 font-mono text-[11px]"
                >
                  <span className="text-foreground/80">
                    {port.host ?? 'auto'}:{port.container}
                  </span>
                  <span className="text-muted-foreground">{port.protocol ?? 'tcp'}</span>
                </div>
              ))}
            </div>
          )}
          <ServiceIngressEditor
            rules={ingressRules}
            ports={ports.map((p) => p.container)}
            running={service.status === 'running'}
            autoUrl={ingressUrl}
            onChange={(rules) => onAction?.({ type: 'updateIngress', ingressRules: rules })}
          />
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-sm">Volumes</CardTitle>
        </CardHeader>
        <CardContent>
          {volumes.length === 0 && persistentVolumes.length === 0 ? (
            <div className="text-[11px] text-muted-foreground">No volumes mounted</div>
          ) : (
            <div className="space-y-1">
              {persistentVolumes.map((path) => (
                <div
                  key={path}
                  className="flex items-center gap-2 rounded-md border border-border bg-background/60 px-2 py-1 font-mono text-[11px] text-foreground/80"
                >
                  <span className="truncate">{path}</span>
                  <Badge variant="secondary" className="ml-auto shrink-0 text-[9px] uppercase">
                    persisted
                  </Badge>
                </div>
              ))}
              {volumes.map((vol, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-md border border-border bg-background/60 px-2 py-1 font-mono text-[11px] text-foreground/80"
                >
                  <span className="truncate text-muted-foreground">{vol.volumeId}</span>
                  <span className="text-muted-foreground">-&gt;</span>
                  <span className="truncate">{vol.containerPath}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {service.containerId && (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm">Container</CardTitle>
          </CardHeader>
          <CardContent>
            <PropertyLine label="id" value={service.containerId} mono copyable />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
