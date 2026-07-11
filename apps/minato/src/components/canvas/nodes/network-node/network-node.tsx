import type { Network } from '@mizu/nagare-domain'
import { IconNetwork, IconTrash } from '@tabler/icons-react'
import { type Node, type NodeProps, Position } from '@xyflow/react'
import { useState } from 'react'
import { BaseHandle } from '@/components/canvas/shared/base-handle'
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/components/canvas/shared/base-node'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface NetworkNodeData {
  network: Network
  onDelete?: () => void
  [key: string]: unknown
}

export type NetworkNodeType = Node<NetworkNodeData, 'network'>

export function NetworkNode({ data, selected }: NodeProps<NetworkNodeType>) {
  const [isHovered, setIsHovered] = useState(false)
  const { network, onDelete } = data

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: React Flow nodes require mouse events
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <BaseHandle type="target" position={Position.Left} />
      <BaseHandle type="source" position={Position.Right} />

      <BaseNode
        className={cn(
          'w-[180px] border-blue-500/30 bg-blue-500/5 border-dashed',
          selected && 'ring-2 ring-blue-500',
        )}
      >
        <BaseNodeHeader className="bg-blue-500/10">
          <div className="flex items-center gap-2">
            <IconNetwork className="size-4 text-blue-600" />
            <BaseNodeHeaderTitle className="text-sm">{network.name}</BaseNodeHeaderTitle>
          </div>
        </BaseNodeHeader>

        <BaseNodeContent className="pt-0 space-y-1">
          {network.subnet && (
            <p className="truncate text-xs text-muted-foreground font-mono">{network.subnet}</p>
          )}

          <div className="flex items-center gap-2">
            {network.internal && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Internal
              </Badge>
            )}
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
            <TooltipContent>Delete network</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}
