import type { DatabaseStatus, ServiceSourceType, ServiceStatus } from '@mizu/nagare-domain'
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
  SERVICE_STATUS_META,
  type ServiceDrawerHeaderProps,
  type StatusMeta,
} from './lib'

/** Icon + editable name + status pill + lifecycle actions + close. */
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
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className={cn('inline-block size-1.5 rounded-full', status.dot)} />
          <span className={status.color}>{status.label}</span>
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
