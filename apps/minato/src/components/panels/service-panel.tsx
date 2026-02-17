import type {
  PortMapping,
  Service,
  ServiceSourceType,
  ServiceStatus,
  VolumeMount,
} from '@mizu/minato-domain'
import {
  IconBrandDocker,
  IconBrandGit,
  IconCopy,
  IconFileCode,
  IconPlayerPlay,
  IconPlayerStop,
  IconPlus,
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

export interface ServicePanelProps {
  service: Service
  onUpdate?: (data: Partial<Service>) => void
  onDeploy?: () => void
  onStart?: () => void
  onStop?: () => void
  onRestart?: () => void
  onDelete?: () => void
  onClose?: () => void
}

const statusColors: Record<ServiceStatus, string> = {
  created: 'bg-gray-400',
  building: 'bg-amber-400',
  starting: 'bg-yellow-400',
  running: 'bg-emerald-500',
  stopping: 'bg-yellow-400',
  stopped: 'bg-gray-400',
  error: 'bg-red-500',
}

const statusLabels: Record<ServiceStatus, string> = {
  created: 'Created',
  building: 'Building',
  starting: 'Starting',
  running: 'Running',
  stopping: 'Stopping',
  stopped: 'Stopped',
  error: 'Error',
}

/**
 * Status badge component
 */
function StatusBadge({ status }: { status: ServiceStatus }) {
  return (
    <Badge variant={status === 'error' ? 'destructive' : 'secondary'} className="gap-1.5">
      <span
        className={cn(
          'size-2 rounded-full',
          statusColors[status],
          (status === 'building' || status === 'starting' || status === 'stopping') &&
            'animate-pulse',
        )}
      />
      {statusLabels[status]}
    </Badge>
  )
}

/**
 * Source type icon
 */
function SourceTypeIcon({ type }: { type: ServiceSourceType }) {
  const iconProps = { className: 'size-4' }
  switch (type) {
    case 'image':
      return <IconBrandDocker {...iconProps} />
    case 'git':
      return <IconBrandGit {...iconProps} />
    case 'template':
      return <IconFileCode {...iconProps} />
  }
}

interface EnvVarEntry {
  key: string
  value: string
}

/**
 * Environment variables editor
 */
function EnvVarsEditor({
  envVars,
  onChange,
}: {
  envVars: EnvVarEntry[]
  onChange: (vars: EnvVarEntry[]) => void
}) {
  const handleAdd = () => {
    onChange([...envVars, { key: '', value: '' }])
  }

  const handleRemove = (index: number) => {
    onChange(envVars.filter((_, i) => i !== index))
  }

  const handleChange = (index: number, field: 'key' | 'value', value: string) => {
    const updated = envVars.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
    onChange(updated)
  }

  return (
    <div className="space-y-2">
      {envVars.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          No environment variables configured
        </p>
      ) : (
        envVars.map((entry, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="KEY"
              value={entry.key}
              onChange={(e) => handleChange(index, 'key', e.target.value)}
              className="h-8 text-xs font-mono flex-1"
            />
            <Input
              placeholder="value"
              value={entry.value}
              onChange={(e) => handleChange(index, 'value', e.target.value)}
              className="h-8 text-xs font-mono flex-1"
              type="password"
            />
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => handleRemove(index)}
              className="text-muted-foreground hover:text-destructive"
            >
              <IconX className="size-3.5" />
            </Button>
          </div>
        ))
      )}
      <Button variant="outline" size="sm" onClick={handleAdd} className="w-full">
        <IconPlus className="size-3.5 mr-1" />
        Add Variable
      </Button>
    </div>
  )
}

/**
 * Port mappings display
 */
function PortMappings({ ports }: { ports: PortMapping[] }) {
  if (ports.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-2">No ports configured</p>
  }

  return (
    <div className="space-y-1">
      {ports.map((port, index) => (
        <div
          key={index}
          className="flex items-center justify-between text-xs font-mono bg-muted/50 rounded px-2 py-1"
        >
          <span>
            {port.host ?? 'auto'}:{port.container}
          </span>
          <span className="text-muted-foreground">{port.protocol ?? 'tcp'}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Volume mounts display
 */
function VolumeMounts({ volumes }: { volumes: VolumeMount[] }) {
  if (volumes.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-2">No volumes mounted</p>
  }

  return (
    <div className="space-y-1">
      {volumes.map((vol, index) => (
        <div
          key={index}
          className="flex items-center gap-2 text-xs font-mono bg-muted/50 rounded px-2 py-1"
        >
          <span className="text-muted-foreground truncate">{vol.volumeId}</span>
          <span className="text-muted-foreground">-&gt;</span>
          <span className="truncate">{vol.containerPath}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Service detail panel component
 * Shows service configuration, environment variables, and logs
 */
export function ServicePanel({
  service,
  onUpdate,
  onDeploy,
  onStart,
  onStop,
  onRestart,
  onDelete,
  onClose,
}: ServicePanelProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(service.name)
  const [envVars, setEnvVars] = useState<EnvVarEntry[]>(() => {
    // Parse env vars from service if available
    // This is a simplified version - actual implementation would decrypt from envVars field
    return []
  })

  const status = service.status as ServiceStatus
  const sourceType = service.sourceType as ServiceSourceType
  const sourceConfig = service.sourceConfig as Record<string, unknown>
  const ports = (service.ports ?? []) as PortMapping[]
  const volumes = (service.volumeMounts ?? []) as VolumeMount[]

  const canStart = status === 'created' || status === 'stopped' || status === 'error'
  const canStop = status === 'running' || status === 'starting'
  const canRestart = status === 'running'
  const canDeploy = status !== 'building'

  const handleNameSave = () => {
    if (editedName.trim() && editedName !== service.name) {
      onUpdate?.({ name: editedName.trim() })
    }
    setIsEditingName(false)
  }

  const handleEnvVarsChange = (vars: EnvVarEntry[]) => {
    setEnvVars(vars)
    // TODO: Encrypt and save via onUpdate
  }

  /**
   * Get source info display string
   */
  const getSourceInfo = (): string => {
    switch (sourceType) {
      case 'image': {
        const image = sourceConfig.image as string
        const tag = sourceConfig.tag as string | undefined
        return tag ? `${image}:${tag}` : image
      }
      case 'git':
        return sourceConfig.repository as string
      case 'template':
        return sourceConfig.templateId as string
      default:
        return 'Unknown'
    }
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
              {service.name}
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

        {/* Action buttons */}
        <div className="flex gap-1.5">
          {canDeploy && onDeploy && (
            <Tooltip>
              <TooltipTrigger render={<Button variant="outline" size="sm" onClick={onDeploy} />}>
                <IconRocket className="size-3.5 mr-1" />
                Deploy
              </TooltipTrigger>
              <TooltipContent>Deploy service</TooltipContent>
            </Tooltip>
          )}
          {canStart && onStart && (
            <Tooltip>
              <TooltipTrigger
                render={<Button variant="outline" size="icon-sm" onClick={onStart} />}
              >
                <IconPlayerPlay className="size-3.5 text-emerald-600" />
              </TooltipTrigger>
              <TooltipContent>Start service</TooltipContent>
            </Tooltip>
          )}
          {canStop && onStop && (
            <Tooltip>
              <TooltipTrigger render={<Button variant="outline" size="icon-sm" onClick={onStop} />}>
                <IconPlayerStop className="size-3.5 text-amber-600" />
              </TooltipTrigger>
              <TooltipContent>Stop service</TooltipContent>
            </Tooltip>
          )}
          {canRestart && onRestart && (
            <Tooltip>
              <TooltipTrigger
                render={<Button variant="outline" size="icon-sm" onClick={onRestart} />}
              >
                <IconRefresh className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent>Restart service</TooltipContent>
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
              <TooltipContent>Delete service</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="config" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="config">Config</TabsTrigger>
          <TabsTrigger value="env">Env</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Config Tab */}
          <TabsContent value="config" className="p-4 space-y-4 mt-0">
            {/* Source */}
            <Card size="sm" className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <SourceTypeIcon type={sourceType} />
                <span className="text-sm font-medium">Source</span>
              </div>
              <div className="text-xs text-muted-foreground break-all">{getSourceInfo()}</div>
            </Card>

            {/* Ports */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Ports</h4>
              <PortMappings ports={ports} />
            </div>

            <Separator />

            {/* Volumes */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Volumes</h4>
              <VolumeMounts volumes={volumes} />
            </div>

            <Separator />

            {/* Container ID */}
            {service.containerId && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Container ID</h4>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded truncate flex-1">
                    {service.containerId}
                  </code>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => navigator.clipboard.writeText(service.containerId ?? '')}
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
          </TabsContent>

          {/* Env Tab */}
          <TabsContent value="env" className="p-4 mt-0">
            <EnvVarsEditor envVars={envVars} onChange={handleEnvVarsChange} />
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="mt-0 h-[400px]">
            <LogsViewer serviceId={service.id} height="100%" />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
