import type {
  Database,
  DatabaseCredentials,
  DatabaseStatus,
  DatabaseType,
  PortMapping,
  Service,
  ServiceSourceType,
  ServiceStatus,
  VolumeMount,
} from '@mizu/minato-domain'
import {
  IconBrandDocker,
  IconBrandGit,
  IconCheck,
  IconCopy,
  IconFileCode,
  IconPencil,
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
  IconRocket,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export type PropertyAction =
  | { type: 'updateName'; name: string }
  | { type: 'updateSourceConfig'; sourceConfig: { image: string; tag?: string } }
  | { type: 'updateCredentials'; credentials: { username: string; password: string; database: string } }
  | { type: 'delete' }
  | { type: 'deploy' }
  | { type: 'start' }
  | { type: 'stop' }
  | { type: 'restart' }

interface NodePropertyEditorProps {
  nodeId: string
  service: Service | null
  database: Database | null
  nodeType: 'service' | 'database' | null
  onClose: () => void
  onAction?: (action: PropertyAction) => void
  isActionPending?: boolean
}

const serviceStatusColors: Record<ServiceStatus, string> = {
  created: 'text-neutral-500',
  building: 'text-amber-500',
  starting: 'text-yellow-500',
  running: 'text-emerald-500',
  stopping: 'text-yellow-500',
  stopped: 'text-neutral-500',
  error: 'text-red-500',
}

const dbStatusColors: Record<DatabaseStatus, string> = {
  created: 'text-neutral-500',
  starting: 'text-yellow-500',
  running: 'text-emerald-500',
  stopping: 'text-yellow-500',
  stopped: 'text-neutral-500',
  error: 'text-red-500',
}

const databaseTypeLabels: Record<DatabaseType, string> = {
  postgres: 'PostgreSQL',
  mysql: 'MySQL',
  redis: 'Redis',
  mongodb: 'MongoDB',
  mariadb: 'MariaDB',
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-neutral-700">
      # {title}
    </div>
  )
}

function PropertyLine({
  label,
  value,
  accent = false,
  mono = false,
  copyable = false,
}: {
  label: string
  value: string | number | null | undefined
  accent?: boolean
  mono?: boolean
  copyable?: boolean
}) {
  const handleCopy = () => {
    if (value) navigator.clipboard.writeText(String(value))
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-neutral-700">&#x25b8;</span>
      <span className="min-w-[80px] shrink-0 text-neutral-600">{label}</span>
      <span
        className={cn(
          'truncate',
          accent ? 'text-blue-500' : 'text-neutral-400',
          mono && 'font-mono text-[11px]',
        )}
      >
        {value ?? '\u2014'}
      </span>
      {copyable && value && (
        <button
          type="button"
          onClick={handleCopy}
          className="ml-auto shrink-0 text-neutral-700 hover:text-neutral-400"
        >
          <IconCopy className="size-3" />
        </button>
      )}
    </div>
  )
}

function EditablePropertyLine({
  label,
  value,
  onSave,
}: {
  label: string
  value: string
  onSave: (value: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const handleSave = useCallback(() => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) {
      onSave(trimmed)
    }
    setEditing(false)
  }, [draft, value, onSave])

  if (editing) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-neutral-700">&#x25b8;</span>
        <span className="min-w-[80px] shrink-0 text-neutral-600">{label}</span>
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') {
              setDraft(value)
              setEditing(false)
            }
          }}
          onBlur={handleSave}
          className="flex-1 border-b border-blue-500/50 bg-transparent text-xs text-neutral-300 outline-none"
        />
        <button
          type="button"
          onClick={handleSave}
          className="shrink-0 text-blue-500 hover:text-blue-400"
        >
          <IconCheck className="size-3" />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      className="group flex w-full items-center gap-2 text-left text-xs"
      onClick={() => {
        setDraft(value)
        setEditing(true)
      }}
    >
      <span className="text-neutral-700">&#x25b8;</span>
      <span className="min-w-[80px] shrink-0 text-neutral-600">{label}</span>
      <span className="truncate text-neutral-400 group-hover:text-neutral-200">
        {value || '\u2014'}
      </span>
      <span className="ml-auto shrink-0 text-neutral-800 group-hover:text-neutral-500">
        <IconPencil className="size-3" />
      </span>
    </button>
  )
}


function ActionButton({
  label,
  icon,
  onClick,
  destructive = false,
  disabled = false,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  destructive?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-1.5 rounded border px-2.5 py-1 text-[10px] transition-all disabled:opacity-50',
        destructive
          ? 'border-red-500/20 text-red-500 hover:border-red-500/40 hover:bg-red-500/5'
          : 'border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200',
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function SourceTypeIcon({ type }: { type: ServiceSourceType }) {
  const cls = 'size-3 text-neutral-500'
  switch (type) {
    case 'image':
      return <IconBrandDocker className={cls} />
    case 'git':
      return <IconBrandGit className={cls} />
    case 'template':
      return <IconFileCode className={cls} />
  }
}

function ServiceEditor({
  service,
  onAction,
  isActionPending,
}: {
  service: Service
  onAction?: (action: PropertyAction) => void
  isActionPending?: boolean
}) {
  const status = service.status as ServiceStatus
  const sourceType = service.sourceType as ServiceSourceType
  const sourceConfig = service.sourceConfig as Record<string, unknown>
  const ports = (service.ports ?? []) as PortMapping[]
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

function parseDatabaseCredentials(
  credentials: string | null,
): DatabaseCredentials | null {
  if (!credentials) return null
  try {
    return JSON.parse(credentials) as DatabaseCredentials
  } catch {
    return null
  }
}

function DatabaseEditor({
  database,
  onAction,
  isActionPending,
}: {
  database: Database
  onAction?: (action: PropertyAction) => void
  isActionPending?: boolean
}) {
  const status = database.status as DatabaseStatus
  const dbType = database.type as DatabaseType
  const creds = parseDatabaseCredentials(database.credentials)

  return (
    <div className="space-y-5">
      {/* Identity */}
      <div>
        <SectionHeader title="identity" />
        <div className="space-y-1.5">
          <EditablePropertyLine
            label="name"
            value={database.name}
            onSave={(name) => onAction?.({ type: 'updateName', name })}
          />
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-700">&#x25b8;</span>
            <span className="min-w-[80px] shrink-0 text-neutral-600">type</span>
            <span className="text-blue-500">{databaseTypeLabels[dbType] ?? dbType}</span>
          </div>
          {database.version && <PropertyLine label="version" value={`v${database.version}`} />}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-700">&#x25b8;</span>
            <span className="min-w-[80px] shrink-0 text-neutral-600">status</span>
            <span className={cn('flex items-center gap-1', dbStatusColors[status])}>
              <span
                className={cn(
                  'inline-block size-1.5 rounded-full bg-current',
                  (status === 'starting' || status === 'stopping') && 'animate-pulse',
                )}
              />
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Connection */}
      <div>
        <SectionHeader title="connection" />
        <div className="space-y-1.5">
          <PropertyLine label="host" value="localhost" mono copyable />
          <PropertyLine label="port" value={database.port} mono copyable />
          <EditablePropertyLine
            label="user"
            value={creds?.username ?? ''}
            onSave={(username) =>
              onAction?.({
                type: 'updateCredentials',
                credentials: {
                  username,
                  password: creds?.password ?? '',
                  database: creds?.database ?? '',
                },
              })
            }
          />
          <EditablePropertyLine
            label="password"
            value={creds?.password ?? ''}
            onSave={(password) =>
              onAction?.({
                type: 'updateCredentials',
                credentials: {
                  username: creds?.username ?? '',
                  password,
                  database: creds?.database ?? '',
                },
              })
            }
          />
          <EditablePropertyLine
            label="database"
            value={creds?.database ?? ''}
            onSave={(database) =>
              onAction?.({
                type: 'updateCredentials',
                credentials: {
                  username: creds?.username ?? '',
                  password: creds?.password ?? '',
                  database,
                },
              })
            }
          />
        </div>
      </div>

      {/* Container */}
      {database.containerId && (
        <div>
          <SectionHeader title="container" />
          <PropertyLine label="id" value={database.containerId} mono copyable />
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

export function NodePropertyEditor({
  service,
  database,
  nodeType,
  onClose,
  onAction,
  isActionPending,
}: NodePropertyEditorProps) {
  const entityName =
    nodeType === 'service'
      ? (service?.name ?? 'service')
      : nodeType === 'database'
        ? (database?.name ?? 'database')
        : 'node'

  return (
    <div className="flex h-full flex-col font-mono">
      {/* Header with traffic-light dots */}
      <div className="group flex items-center gap-2 border-b border-neutral-800 px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-800 transition-colors group-hover:bg-red-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-800 transition-colors group-hover:bg-yellow-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-800 transition-colors group-hover:bg-green-500" />
        </div>
        <span className="flex-1 text-[11px] text-neutral-600">{entityName}.properties</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-neutral-600 transition-colors hover:text-neutral-400"
        >
          <IconX className="size-3" />
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {service && (
            <ServiceEditor
              service={service}
              onAction={onAction}
              isActionPending={isActionPending}
            />
          )}
          {database && (
            <DatabaseEditor
              database={database}
              onAction={onAction}
              isActionPending={isActionPending}
            />
          )}
          {!service && !database && (
            <div className="py-8 text-center text-[10px] text-neutral-700">
              $ no properties available
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
