import type {
  DatabaseStatus,
  PortMapping,
  ServiceSettings,
  ServiceSourceType,
  ServiceStatus,
} from '@mizu/nagare-domain'
import {
  IconDatabase,
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
  IconRocket,
  IconX,
} from '@tabler/icons-react'
import { SourceTypeIcon, useEditableProperty } from '@/components/canvas/shared'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  DATABASE_STATUS_META,
  DATABASE_TYPE_LABELS,
  formatCompactDuration,
  SERVICE_STATUS_META,
  type ServiceDrawerHeaderProps,
  type StatusMeta,
} from './lib'

/** Icon + editable name + status pill + meta strip + lifecycle actions + close. */
export function ServiceDrawerHeader({
  nodeType,
  service,
  database,
  onClose,
  onAction,
  isActionPending,
}: ServiceDrawerHeaderProps) {
  const entity = nodeType === 'service' ? service : database
  const name = entity?.name ?? ''
  const status: StatusMeta =
    nodeType === 'service'
      ? SERVICE_STATUS_META[(service?.status ?? 'created') as ServiceStatus]
      : DATABASE_STATUS_META[(database?.status ?? 'created') as DatabaseStatus]

  const { editing, draft, setDraft, inputRef, handleSave, startEditing, cancelEditing } =
    useEditableProperty({
      value: name,
      onSave: (next) => onAction?.({ type: 'updateName', name: next }),
    })

  const { image, meta } = buildMeta(nodeType, service, database)

  const lifecycle: Array<{
    key: 'deploy' | 'start' | 'stop' | 'restart'
    label: string
    icon: typeof IconRocket
  }> = [
    { key: 'deploy', label: 'Deploy', icon: IconRocket },
    { key: 'start', label: 'Start', icon: IconPlayerPlay },
    { key: 'stop', label: 'Stop', icon: IconPlayerStop },
    ...(nodeType === 'service'
      ? [{ key: 'restart' as const, label: 'Restart', icon: IconRefresh }]
      : []),
  ]

  return (
    <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        {nodeType === 'database' ? (
          <IconDatabase className="size-4 text-primary" />
        ) : (
          <SourceTypeIcon type={(service?.sourceType ?? 'image') as ServiceSourceType} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') cancelEditing()
              }}
              onBlur={handleSave}
              className="w-full border-b border-primary/50 bg-transparent text-sm font-semibold text-foreground outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={startEditing}
              className="block max-w-full truncate text-left text-sm font-semibold text-foreground hover:text-primary"
              title="Rename"
            >
              {name}
            </button>
          )}
          <span className="flex shrink-0 items-center gap-1.5 text-[11px]">
            <span className={cn('inline-block size-1.5 rounded-full', status.dot)} />
            <span className={status.color}>{status.label}</span>
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-muted-foreground">
          {image && <span className="truncate font-mono text-foreground/70">{image}</span>}
          {meta.map((part, i) => (
            <span key={part} className="flex shrink-0 items-center gap-1.5">
              {(image || i > 0) && <span aria-hidden>·</span>}
              <span>{part}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {lifecycle.map(({ key, label, icon: ActionIcon }) => (
          <Tooltip key={key}>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isActionPending}
                  onClick={() => onAction?.({ type: key })}
                >
                  <ActionIcon className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
        <div className="mx-1 h-4 w-px bg-border" />
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
          <IconX className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

/** Meta strip parts: mono image ref + a `·`-joined summary line. */
function buildMeta(
  nodeType: ServiceDrawerHeaderProps['nodeType'],
  service: ServiceDrawerHeaderProps['service'],
  database: ServiceDrawerHeaderProps['database'],
): { image: string | null; meta: string[] } {
  if (nodeType === 'service' && service) {
    const sourceConfig = (service.sourceConfig ?? {}) as Record<string, unknown>
    const ports = (service.ports ?? []) as PortMapping[]
    const settings = (service.settings ?? {}) as ServiceSettings
    const image =
      service.sourceType === 'image'
        ? `${(sourceConfig.image as string) ?? '?'}:${(sourceConfig.tag as string) ?? 'latest'}`
        : ((sourceConfig.repository as string) ??
          (sourceConfig.templateId as string) ??
          service.sourceType)
    const exposure =
      settings.exposed === true
        ? 'Public'
        : (settings.ingressRules?.length ?? 0) > 0
          ? `${settings.ingressRules?.length} routes`
          : 'Private'
    const meta = [`${ports.length} ${ports.length === 1 ? 'port' : 'ports'}`, exposure]
    if (service.status === 'running') meta.push(`up ${formatCompactDuration(service.updatedAt)}`)
    return { image, meta }
  }
  if (nodeType === 'database' && database) {
    const label = DATABASE_TYPE_LABELS[database.type] ?? database.type
    const meta = [database.version ? `${label} v${database.version}` : label, `:${database.port}`]
    if (database.status === 'running') meta.push(`up ${formatCompactDuration(database.updatedAt)}`)
    return { image: null, meta }
  }
  return { image: null, meta: [] }
}
