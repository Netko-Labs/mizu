import type { DatabaseStatus, DatabaseType } from '@mizu/nagare-domain'
import { IconPlayerPlay, IconPlayerStop, IconRocket, IconTrash } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import {
  type DatabasePropertiesProps,
  databaseTypeLabels,
  dbStatusColors,
  parseDatabaseCredentials,
} from './lib'
import {
  ActionButton,
  EditablePropertyLine,
  PropertyLine,
  SectionHeader,
} from './property-primitives'

export function DatabaseProperties({
  database,
  onAction,
  isActionPending,
}: DatabasePropertiesProps) {
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
