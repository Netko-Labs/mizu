import type { Service, ServiceSourceType, ServiceStatus } from '@mizu/minato-domain'
import {
  IconBrandDocker,
  IconBrandGit,
  IconBrandGolang,
  IconBrandNodejs,
  IconBrandPhp,
  IconBrandPython,
  IconCoffee,
  IconDiamond,
  IconFileCode,
  IconPlayerPlay,
  IconPlayerStop,
  IconServer,
  IconSettingsAutomation,
  IconTerminal2,
  IconTrash,
  IconWorldWww,
} from '@tabler/icons-react'
import { type Node, type NodeProps, Position } from '@xyflow/react'
import { useState } from 'react'
import { BaseHandle } from '@/components/canvas/base-handle'
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/components/canvas/base-node'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface ServiceNodeData {
  service: Service
  onStart?: () => void
  onStop?: () => void
  onDelete?: () => void
  onViewLogs?: () => void
  [key: string]: unknown
}

export type ServiceNodeType = Node<ServiceNodeData, 'service'>

const statusConfig: Record<ServiceStatus, { label: string; color: string; dot: string }> = {
  created: { label: 'Idle', color: 'text-neutral-500', dot: 'bg-neutral-500' },
  building: { label: 'Building', color: 'text-blue-400', dot: 'bg-blue-400 animate-pulse' },
  starting: { label: 'Starting', color: 'text-amber-400', dot: 'bg-amber-400 animate-pulse' },
  running: { label: 'Online', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  stopping: { label: 'Stopping', color: 'text-amber-400', dot: 'bg-amber-400 animate-pulse' },
  stopped: { label: 'Offline', color: 'text-neutral-500', dot: 'bg-neutral-500' },
  error: { label: 'Error', color: 'text-red-400', dot: 'bg-red-400' },
}

function SourceTypeIcon({ type }: { type: ServiceSourceType }) {
  switch (type) {
    case 'image':
      return <IconBrandDocker className="size-3.5" />
    case 'git':
      return <IconBrandGit className="size-3.5" />
    case 'template':
      return <IconFileCode className="size-3.5" />
  }
}

function getSourceInfo(service: Service): string {
  const config = (service.sourceConfig ?? {}) as Record<string, unknown>

  switch (service.sourceType) {
    case 'image': {
      const image = config.image as string | undefined
      const tag = config.tag as string | undefined
      if (!image) return 'Docker image'
      return tag ? `${image}:${tag}` : image
    }
    case 'git': {
      const repo = config.repository as string | undefined
      if (!repo) return 'Git repository'
      const repoName = repo.split('/').pop()?.replace('.git', '') ?? repo
      return repoName
    }
    case 'template': {
      const templateId = config.templateId as string | undefined
      return templateId ?? 'Template'
    }
    default:
      return 'Unknown'
  }
}

/** Icon based on source image name */
function ServiceIcon({ service }: { service: Service }) {
  const config = (service.sourceConfig ?? {}) as Record<string, unknown>
  const image = (config.image as string | undefined)?.toLowerCase() ?? ''

  if (image.includes('nginx') || image.includes('caddy') || image.includes('apache'))
    return <IconWorldWww className="size-5 text-blue-400" />
  if (image.includes('node') || image.includes('deno') || image.includes('bun'))
    return <IconBrandNodejs className="size-5 text-emerald-400" />
  if (image.includes('python') || image.includes('django') || image.includes('flask'))
    return <IconBrandPython className="size-5 text-yellow-400" />
  if (image.includes('go') || image.includes('golang'))
    return <IconBrandGolang className="size-5 text-cyan-400" />
  if (image.includes('rust'))
    return <IconSettingsAutomation className="size-5 text-orange-400" />
  if (image.includes('ruby') || image.includes('rails'))
    return <IconDiamond className="size-5 text-red-400" />
  if (image.includes('php') || image.includes('laravel'))
    return <IconBrandPhp className="size-5 text-indigo-400" />
  if (image.includes('java') || image.includes('spring'))
    return <IconCoffee className="size-5 text-amber-400" />
  if (service.sourceType === 'git')
    return <IconBrandGit className="size-5 text-orange-400" />
  if (service.sourceType === 'template')
    return <IconFileCode className="size-5 text-purple-400" />

  return <IconServer className="size-5 text-blue-400" />
}

export function ServiceNode({ data, selected }: NodeProps<ServiceNodeType>) {
  const [isHovered, setIsHovered] = useState(false)
  const { service, onStart, onStop, onDelete, onViewLogs } = data

  const status = service.status as ServiceStatus
  const sourceType = service.sourceType as ServiceSourceType
  const canStart = status === 'created' || status === 'stopped' || status === 'error'
  const canStop = status === 'running' || status === 'starting'
  const cfg = statusConfig[status]

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: React Flow nodes require mouse events
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <BaseHandle type="target" position={Position.Left} />
      <BaseHandle type="source" position={Position.Right} />

      <BaseNode className={cn('w-[240px]', selected && 'border-blue-500/30')}>
        <BaseNodeHeader>
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
            <ServiceIcon service={service} />
          </div>
          <BaseNodeHeaderTitle>{service.name}</BaseNodeHeaderTitle>
        </BaseNodeHeader>

        <BaseNodeContent>
          {/* Source info */}
          <div className="flex items-center gap-1.5 text-neutral-500">
            <SourceTypeIcon type={sourceType} />
            <span className="truncate text-xs">{getSourceInfo(service)}</span>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className={cn('size-2 rounded-full', cfg.dot)} />
            <span className={cn('text-xs font-medium', cfg.color)}>{cfg.label}</span>
          </div>
        </BaseNodeContent>
      </BaseNode>

      {/* Hover action bar */}
      <div
        className={cn(
          'absolute -top-10 left-1/2 flex -translate-x-1/2 gap-0.5 rounded-lg border border-blue-500/10 bg-black p-1 shadow-xl shadow-black/60 transition-all duration-150',
          isHovered || selected ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-95',
        )}
      >
        {canStart && onStart && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon-xs" onClick={onStart}>
                  <IconPlayerPlay className="size-3.5 text-emerald-500" />
                </Button>
              }
            />
            <TooltipContent>Start</TooltipContent>
          </Tooltip>
        )}

        {canStop && onStop && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon-xs" onClick={onStop}>
                  <IconPlayerStop className="size-3.5 text-amber-500" />
                </Button>
              }
            />
            <TooltipContent>Stop</TooltipContent>
          </Tooltip>
        )}

        {onViewLogs && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon-xs" onClick={onViewLogs}>
                  <IconTerminal2 className="size-3.5 text-blue-400" />
                </Button>
              }
            />
            <TooltipContent>Logs</TooltipContent>
          </Tooltip>
        )}

        {onDelete && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon-xs" onClick={onDelete}>
                  <IconTrash className="size-3.5 text-red-400" />
                </Button>
              }
            />
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}
