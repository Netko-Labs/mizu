import type { EnvGroup } from '@mizu/minato-domain'
import { IconKey, IconLock, IconTrash } from '@tabler/icons-react'
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

export interface SecretNodeData {
  envGroup: EnvGroup
  keyCount?: number
  onDelete?: () => void
  [key: string]: unknown
}

export type SecretNodeType = Node<SecretNodeData, 'secret'>

export function SecretNode({ data, selected }: NodeProps<SecretNodeType>) {
  const [isHovered, setIsHovered] = useState(false)
  const { envGroup, keyCount = 0, onDelete } = data

  const isSecret = envGroup.isSecret

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: React Flow nodes require mouse events
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <BaseHandle type="source" position={Position.Right} />

      <BaseNode
        className={cn(
          'w-[180px]',
          isSecret
            ? 'border-purple-500/30 bg-purple-500/5'
            : 'border-emerald-500/30 bg-emerald-500/5',
          selected && (isSecret ? 'ring-2 ring-purple-500' : 'ring-2 ring-emerald-500'),
        )}
      >
        <BaseNodeHeader className={isSecret ? 'bg-purple-500/10' : 'bg-emerald-500/10'}>
          <div className="flex items-center gap-2">
            {isSecret ? (
              <IconLock className="size-4 text-purple-600" />
            ) : (
              <IconKey className="size-4 text-emerald-600" />
            )}
            <BaseNodeHeaderTitle className="text-sm">{envGroup.name}</BaseNodeHeaderTitle>
          </div>
        </BaseNodeHeader>

        <BaseNodeContent className="pt-0 space-y-1">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] px-1.5 py-0',
                isSecret ? 'border-purple-500/30' : 'border-emerald-500/30',
              )}
            >
              {isSecret ? 'Secret' : 'Env'}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {keyCount} {keyCount === 1 ? 'key' : 'keys'}
            </span>
          </div>

          {isSecret && (
            <p className="text-[10px] text-muted-foreground italic">Values encrypted</p>
          )}
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
            <TooltipContent>Delete {isSecret ? 'secret' : 'env group'}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}
