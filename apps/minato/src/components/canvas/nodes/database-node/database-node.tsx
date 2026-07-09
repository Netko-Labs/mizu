import type { Database, DatabaseStatus, DatabaseType } from '@mizu/nagare-domain'
import type { Serialized } from '@/shared/api'
import {
  IconDatabase,
  IconDatabaseCog,
  IconDatabaseHeart,
  IconDatabaseSearch,
  IconDatabaseStar,
  IconDeviceFloppy,
  IconPlayerPlay,
  IconPlayerStop,
  IconTerminal2,
  IconTrash,
} from '@tabler/icons-react'
import { type Node, type NodeProps, Position } from '@xyflow/react'
import { useState } from 'react'
import { BaseHandle } from '@/components/canvas/shared/base-handle'
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/components/canvas/shared/base-node'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface DatabaseNodeData {
  database: Serialized<Database>
  onStart?: () => void
  onStop?: () => void
  onDelete?: () => void
  onViewLogs?: () => void
  [key: string]: unknown
}

export type DatabaseNodeType = Node<DatabaseNodeData, 'database'>

const statusConfig: Record<DatabaseStatus, { label: string; color: string; dot: string }> = {
  created: { label: 'Idle', color: 'text-neutral-500', dot: 'bg-neutral-500' },
  starting: { label: 'Starting', color: 'text-amber-400', dot: 'bg-amber-400 animate-pulse' },
  running: { label: 'Online', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  stopping: { label: 'Stopping', color: 'text-amber-400', dot: 'bg-amber-400 animate-pulse' },
  stopped: { label: 'Offline', color: 'text-neutral-500', dot: 'bg-neutral-500' },
  error: { label: 'Error', color: 'text-red-400', dot: 'bg-red-400' },
}

const databaseConfig: Record<
  DatabaseType,
  { label: string; icon: typeof IconDatabase; color: string }
> = {
  postgres: { label: 'PostgreSQL', icon: IconDatabaseCog, color: 'text-blue-400' },
  mysql: { label: 'MySQL', icon: IconDatabaseStar, color: 'text-cyan-400' },
  redis: { label: 'Redis', icon: IconDatabaseHeart, color: 'text-red-400' },
  mongodb: { label: 'MongoDB', icon: IconDatabaseSearch, color: 'text-emerald-400' },
  mariadb: { label: 'MariaDB', icon: IconDatabase, color: 'text-sky-400' },
}

export function DatabaseNode({ data, selected }: NodeProps<DatabaseNodeType>) {
  const [isHovered, setIsHovered] = useState(false)
  const { database, onStart, onStop, onDelete, onViewLogs } = data

  const status = database.status as DatabaseStatus
  const dbType = database.type as DatabaseType
  const canStart = status === 'created' || status === 'stopped' || status === 'error'
  const canStop = status === 'running' || status === 'starting'
  const cfg = statusConfig[status]
  const dbCfg = databaseConfig[dbType] ?? {
    label: dbType,
    icon: IconDatabase,
    color: 'text-blue-400',
  }
  const DbIcon = dbCfg.icon
  const hasVolume = true

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
            <DbIcon className={cn('size-5', dbCfg.color)} />
          </div>
          <BaseNodeHeaderTitle>{database.name}</BaseNodeHeaderTitle>
        </BaseNodeHeader>

        <BaseNodeContent>
          {/* Type + version */}
          <div className="flex items-center gap-2 text-neutral-500">
            <span className="text-xs">{dbCfg.label}</span>
            {database.version && (
              <>
                <span className="text-neutral-700">·</span>
                <span className="text-xs">v{database.version}</span>
              </>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className={cn('size-2 rounded-full', cfg.dot)} />
            <span className={cn('text-xs font-medium', cfg.color)}>{cfg.label}</span>
          </div>
        </BaseNodeContent>
      </BaseNode>

      {/* Volume sub-card */}
      {hasVolume && (
        <div className="mt-1 ml-4 flex items-center gap-2 rounded-lg border border-blue-500/[0.06] bg-[#050505] px-3 py-1.5 shadow-sm shadow-black/30">
          <IconDeviceFloppy className="size-3.5 text-blue-400/60" />
          <span className="text-[10px] text-neutral-500">{database.name}-data</span>
          <span className="ml-auto text-[10px] text-neutral-700">volume</span>
        </div>
      )}

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
