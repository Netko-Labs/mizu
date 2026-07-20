import type {
  IngressRule,
  PortMapping,
  ServiceSettings,
  ServiceSourceType,
  VolumeMount,
} from '@mizu/nagare-domain'
import { useQuery } from '@tanstack/react-query'
import { PropertyLine, SourceTypeIcon } from '@/components/canvas/shared'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { instanceSettingsQueries } from '@/shared/api'
import { sanitizeResourceName, useIngressUrl } from '../lib'
import type { OverviewTabProps } from './lib'

/**
 * Read-only service summary: what's deployed and where it's reachable.
 * Editing (image, ingress rules, variables) lives in the Settings tab.
 */
export function OverviewTab({ service, projectSlug }: OverviewTabProps) {
  const sourceType = service.sourceType as ServiceSourceType
  const sourceConfig = service.sourceConfig as Record<string, unknown>
  const ports = (service.ports ?? []) as PortMapping[]
  const volumes = (service.volumeMounts ?? []) as VolumeMount[]
  const persistentVolumes = (sourceConfig.volumes as string[] | undefined) ?? []
  const serviceSettings = (service.settings ?? {}) as ServiceSettings
  const ingressRules = serviceSettings.ingressRules ?? []
  const exposed = serviceSettings.exposed === true
  const running = service.status === 'running'
  const autoUrl = useIngressUrl(
    service.name,
    projectSlug,
    running && exposed && ports.length > 0 && ingressRules.length === 0,
  )
  const { data: instanceSettings } = useQuery(instanceSettingsQueries.get())
  const baseDomain = instanceSettings?.domain || 'localhost'

  const sourceRef =
    sourceType === 'image'
      ? `${(sourceConfig.image as string) ?? '?'}:${(sourceConfig.tag as string) ?? 'latest'}`
      : sourceType === 'git'
        ? ((sourceConfig.repository as string) ?? 'not set')
        : ((sourceConfig.templateId as string) ?? 'not set')

  const ruleUrl = (rule: IngressRule): string => {
    const host =
      rule.hostType === 'subdomain' ? `${sanitizeResourceName(rule.host)}.${baseDomain}` : rule.host
    const scheme = rule.hostType === 'custom' || baseDomain !== 'localhost' ? 'https' : 'http'
    return `${scheme}://${host}`
  }

  return (
    <div className="space-y-4 p-4">
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <SourceTypeIcon type={sourceType} />
            Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PropertyLine label={sourceType} value={sourceRef} mono copyable />
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
          {ingressRules.map((rule) => (
            <a
              key={rule.id}
              href={ruleUrl(rule)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 truncate rounded-md border border-primary/20 bg-primary/5 px-2 py-1 font-mono text-[11px] text-primary transition-colors hover:border-primary/40"
            >
              <span className="truncate">{ruleUrl(rule)}</span>
              <span className="ml-auto shrink-0 text-muted-foreground">:{rule.port}</span>
            </a>
          ))}
          {ingressRules.length === 0 && autoUrl && (
            <a
              href={autoUrl}
              target="_blank"
              rel="noreferrer"
              className="block truncate rounded-md border border-primary/20 bg-primary/5 px-2 py-1 font-mono text-[11px] text-primary transition-colors hover:border-primary/40"
            >
              {autoUrl}
            </a>
          )}
          {ingressRules.length === 0 && !exposed && (
            <div className="text-[11px] text-muted-foreground">
              Private — expose it or add ingress rules in Settings.
            </div>
          )}
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
