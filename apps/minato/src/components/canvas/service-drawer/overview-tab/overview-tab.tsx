import type { IngressRule, PortMapping, ServiceSettings, VolumeMount } from '@mizu/nagare-domain'
import { useQuery } from '@tanstack/react-query'
import { PropertyLine } from '@/components/canvas/shared'
import { Badge } from '@/components/ui/badge'
import { instanceSettingsQueries } from '@/shared/api'
import { sanitizeResourceName, useIngressUrl } from '../lib'
import { DrawerSection } from '../shared'
import type { OverviewTabProps } from './lib'
import { MetricsPreview } from './metrics-preview'
import { OverviewStatRow } from './stat-row'

/**
 * Read-only service dashboard: a glance stat row, live metric previews, and
 * where the service is reachable. Editing lives in the Settings tab.
 */
export function OverviewTab({ service, projectSlug, onOpenTab }: OverviewTabProps) {
  const ports = (service.ports ?? []) as PortMapping[]
  const volumes = (service.volumeMounts ?? []) as VolumeMount[]
  const sourceConfig = (service.sourceConfig ?? {}) as Record<string, unknown>
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

  const ruleUrl = (rule: IngressRule): string => {
    const host =
      rule.hostType === 'subdomain' ? `${sanitizeResourceName(rule.host)}.${baseDomain}` : rule.host
    const scheme = rule.hostType === 'custom' || baseDomain !== 'localhost' ? 'https' : 'http'
    return `${scheme}://${host}`
  }

  const hasReachability = ingressRules.length > 0 || Boolean(autoUrl)

  return (
    <div className="space-y-3 p-4">
      <OverviewStatRow service={service} exposed={exposed} hasIngress={ingressRules.length > 0} />

      <MetricsPreview service={service} onOpenTab={onOpenTab} />

      <DrawerSection title="Reachability">
        {hasReachability ? (
          <div className="space-y-1.5">
            {ingressRules.map((rule) => (
              <a
                key={rule.id}
                href={ruleUrl(rule)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 truncate rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1.5 font-mono text-[11px] text-primary transition-colors hover:border-primary/40"
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
                className="block truncate rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1.5 font-mono text-[11px] text-primary transition-colors hover:border-primary/40"
              >
                {autoUrl}
              </a>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground">
            Private — expose it or add ingress rules in Settings.
          </p>
        )}
      </DrawerSection>

      <DrawerSection title="Volumes">
        {volumes.length === 0 && persistentVolumes.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">No volumes mounted</p>
        ) : (
          <div className="space-y-1">
            {persistentVolumes.map((path) => (
              <div
                key={path}
                className="flex items-center gap-2 rounded-md border border-border bg-background/40 px-2 py-1 font-mono text-[11px] text-foreground/80"
              >
                <span className="truncate">{path}</span>
                <Badge variant="secondary" className="ml-auto shrink-0 text-[9px] uppercase">
                  persisted
                </Badge>
              </div>
            ))}
            {volumes.map((vol) => (
              <div
                key={`${vol.volumeId}:${vol.containerPath}`}
                className="flex items-center gap-2 rounded-md border border-border bg-background/40 px-2 py-1 font-mono text-[11px] text-foreground/80"
              >
                <span className="truncate text-muted-foreground">{vol.volumeId}</span>
                <span className="text-muted-foreground">-&gt;</span>
                <span className="truncate">{vol.containerPath}</span>
              </div>
            ))}
          </div>
        )}
      </DrawerSection>

      {service.containerId && (
        <DrawerSection title="Container">
          <PropertyLine label="id" value={service.containerId} mono copyable />
        </DrawerSection>
      )}
    </div>
  )
}
