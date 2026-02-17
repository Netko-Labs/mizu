import type { Database, DatabaseStatus, DatabaseType } from '@mizu/minato-domain'
import {
  IconCopy,
  IconEye,
  IconEyeOff,
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
  IconRocket,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { LogsViewer } from './logs-viewer'

export interface DatabasePanelProps {
  database: Database
  connectionInfo?: {
    host: string
    port: number
    username: string
    password: string
    database: string
    connectionString: string
  }
  onUpdate?: (data: Partial<Database>) => void
  onDeploy?: () => void
  onStart?: () => void
  onStop?: () => void
  onRestart?: () => void
  onDelete?: () => void
  onClose?: () => void
}

const statusColors: Record<DatabaseStatus, string> = {
  created: 'bg-gray-400',
  starting: 'bg-yellow-400',
  running: 'bg-emerald-500',
  stopping: 'bg-yellow-400',
  stopped: 'bg-gray-400',
  error: 'bg-red-500',
}

const statusLabels: Record<DatabaseStatus, string> = {
  created: 'Created',
  starting: 'Starting',
  running: 'Running',
  stopping: 'Stopping',
  stopped: 'Stopped',
  error: 'Error',
}

const databaseTypeLabels: Record<DatabaseType, string> = {
  postgres: 'PostgreSQL',
  mysql: 'MySQL',
  redis: 'Redis',
  mongodb: 'MongoDB',
  mariadb: 'MariaDB',
}

const databaseTypeColors: Record<DatabaseType, string> = {
  postgres: 'text-blue-500',
  mysql: 'text-orange-500',
  redis: 'text-red-500',
  mongodb: 'text-green-500',
  mariadb: 'text-cyan-500',
}

/**
 * Status badge component
 */
function StatusBadge({ status }: { status: DatabaseStatus }) {
  return (
    <Badge variant={status === 'error' ? 'destructive' : 'secondary'} className="gap-1.5">
      <span
        className={cn(
          'size-2 rounded-full',
          statusColors[status],
          (status === 'starting' || status === 'stopping') && 'animate-pulse',
        )}
      />
      {statusLabels[status]}
    </Badge>
  )
}

/**
 * Connection info field with copy button
 */
function ConnectionField({
  label,
  value,
  secret = false,
}: {
  label: string
  value: string
  secret?: boolean
}) {
  const [isVisible, setIsVisible] = useState(!secret)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
  }

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-1">
        <Input
          value={isVisible ? value : '********'}
          readOnly
          className="h-7 text-xs font-mono flex-1"
          type={secret && !isVisible ? 'password' : 'text'}
        />
        {secret && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon-xs" onClick={() => setIsVisible(!isVisible)} />
              }
            >
              {isVisible ? <IconEyeOff className="size-3.5" /> : <IconEye className="size-3.5" />}
            </TooltipTrigger>
            <TooltipContent>{isVisible ? 'Hide' : 'Show'}</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="icon-xs" onClick={handleCopy} />}>
            <IconCopy className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

/**
 * Database detail panel component
 * Shows database configuration, connection info, and logs
 */
export function DatabasePanel({
  database,
  connectionInfo,
  onUpdate,
  onDeploy,
  onStart,
  onStop,
  onRestart,
  onDelete,
  onClose,
}: DatabasePanelProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(database.name)

  const status = database.status as DatabaseStatus
  const dbType = database.type as DatabaseType

  const canStart = status === 'created' || status === 'stopped' || status === 'error'
  const canStop = status === 'running' || status === 'starting'
  const canRestart = status === 'running'
  const canDeploy = status === 'created'
  const showConnectionInfo = status === 'running' && connectionInfo

  const handleNameSave = () => {
    if (editedName.trim() && editedName !== database.name) {
      onUpdate?.({ name: editedName.trim() })
    }
    setIsEditingName(false)
  }

  return (
    <div className="w-80 border-l bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          {isEditingName ? (
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              className="h-7 text-sm font-semibold"
              autoFocus
            />
          ) : (
            <h2
              className="font-semibold cursor-pointer hover:text-primary transition-colors"
              onClick={() => setIsEditingName(true)}
              title="Click to edit"
            >
              {database.name}
            </h2>
          )}
          <div className="flex items-center gap-1">
            <StatusBadge status={status} />
            {onClose && (
              <Button variant="ghost" size="icon-xs" onClick={onClose}>
                <IconX className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Database type badge */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn('gap-1', databaseTypeColors[dbType])}>
            {databaseTypeLabels[dbType]}
          </Badge>
          {database.version && (
            <Badge variant="secondary" className="text-xs">
              v{database.version}
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-1.5">
          {canDeploy && onDeploy && (
            <Tooltip>
              <TooltipTrigger render={<Button variant="outline" size="sm" onClick={onDeploy} />}>
                <IconRocket className="size-3.5 mr-1" />
                Deploy
              </TooltipTrigger>
              <TooltipContent>Deploy database</TooltipContent>
            </Tooltip>
          )}
          {canStart && onStart && (
            <Tooltip>
              <TooltipTrigger
                render={<Button variant="outline" size="icon-sm" onClick={onStart} />}
              >
                <IconPlayerPlay className="size-3.5 text-emerald-600" />
              </TooltipTrigger>
              <TooltipContent>Start database</TooltipContent>
            </Tooltip>
          )}
          {canStop && onStop && (
            <Tooltip>
              <TooltipTrigger render={<Button variant="outline" size="icon-sm" onClick={onStop} />}>
                <IconPlayerStop className="size-3.5 text-amber-600" />
              </TooltipTrigger>
              <TooltipContent>Stop database</TooltipContent>
            </Tooltip>
          )}
          {canRestart && onRestart && (
            <Tooltip>
              <TooltipTrigger
                render={<Button variant="outline" size="icon-sm" onClick={onRestart} />}
              >
                <IconRefresh className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent>Restart database</TooltipContent>
            </Tooltip>
          )}
          <div className="flex-1" />
          {onDelete && (
            <Tooltip>
              <TooltipTrigger
                render={<Button variant="destructive" size="icon-sm" onClick={onDelete} />}
              >
                <IconTrash className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent>Delete database</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="connection" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Connection Tab */}
          <TabsContent value="connection" className="p-4 space-y-4 mt-0">
            {showConnectionInfo ? (
              <>
                {/* Connection String */}
                <Card size="sm" className="p-3 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Connection String
                  </label>
                  <div className="flex items-center gap-1">
                    <code className="text-xs bg-muted px-2 py-1 rounded truncate flex-1 block">
                      {connectionInfo.connectionString}
                    </code>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() =>
                              navigator.clipboard.writeText(connectionInfo.connectionString)
                            }
                          />
                        }
                      >
                        <IconCopy className="size-3.5" />
                      </TooltipTrigger>
                      <TooltipContent>Copy connection string</TooltipContent>
                    </Tooltip>
                  </div>
                </Card>

                <Separator />

                {/* Individual connection fields */}
                <div className="space-y-3">
                  <ConnectionField label="Host" value={connectionInfo.host} />
                  <ConnectionField label="Port" value={String(connectionInfo.port)} />
                  <ConnectionField label="Database" value={connectionInfo.database} />
                  <ConnectionField label="Username" value={connectionInfo.username} />
                  <ConnectionField label="Password" value={connectionInfo.password} secret />
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  {status === 'created'
                    ? 'Deploy the database to see connection info'
                    : status === 'running'
                      ? 'Loading connection info...'
                      : 'Start the database to see connection info'}
                </p>
              </div>
            )}

            <Separator />

            {/* Container ID */}
            {database.containerId && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Container ID</h4>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded truncate flex-1">
                    {database.containerId}
                  </code>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => navigator.clipboard.writeText(database.containerId ?? '')}
                        />
                      }
                    >
                      <IconCopy className="size-3.5" />
                    </TooltipTrigger>
                    <TooltipContent>Copy container ID</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Created</span>
                <span>{new Date(database.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Updated</span>
                <span>{new Date(database.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="mt-0 h-[400px]">
            <LogsViewer databaseId={database.id} height="100%" />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
