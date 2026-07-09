import type { Volume } from '@mizu/nagare-domain'
import { IconDatabase, IconTrash } from '@tabler/icons-react'
import { type Node, type NodeProps, Position } from '@xyflow/react'
import { useState } from 'react'
import { BaseHandle } from '@/components/canvas/base-handle'
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/components/canvas/base-node'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface VolumeNodeData {
  volume: Volume
  onDelete?: () => void
  [key: string]: unknown
}

export type VolumeNodeType = Node<VolumeNodeData, 'volume'>

function formatBytes(bytes: bigint | null | undefined): string {
  if (!bytes) return '—'
  const num = Number(bytes)
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let unitIndex = 0
  let size = num

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

export function VolumeNode({ data, selected }: NodeProps<VolumeNodeType>) {
  const [isHovered, setIsHovered] = useState(false)
  const { volume, onDelete } = data

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: React Flow nodes require mouse events
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <BaseHandle type="target" position={Position.Left} />

      <BaseNode
        className={cn(
          'w-[180px] border-amber-500/30 bg-amber-500/5',
          selected && 'ring-2 ring-amber-500',
        )}
      >
        <BaseNodeHeader className="bg-amber-500/10">
          <div className="flex items-center gap-2">
            <IconDatabase className="size-4 text-amber-600" />
            <BaseNodeHeaderTitle className="text-sm">{volume.name}</BaseNodeHeaderTitle>
          </div>
        </BaseNodeHeader>

        <BaseNodeContent className="pt-0 space-y-1">
          {volume.path && (
            <p className="truncate text-xs text-muted-foreground font-mono">{volume.path}</p>
          )}

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/30">
              Volume
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {formatBytes(volume.sizeBytes)}
            </span>
          </div>
        </BaseNodeContent>
      </BaseNode>

      {/* Action buttons */}
      <div
        className={cn(
          'absolute -top-9 left-1/2 flex -translate-x-1/2 gap-1 rounded-md border bg-card p-1 shadow-md transition-all',
          isHovered || selected ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        {onDelete && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon-xs" onClick={onDelete}>
                  <IconTrash className="size-3.5 text-destructive" />
                </Button>
              }
            />
            <TooltipContent>Delete volume</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}
