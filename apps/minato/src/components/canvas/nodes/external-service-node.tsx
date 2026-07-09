import type { ExternalService, ExternalServiceType } from '@mizu/nagare-domain'
import {
  IconApi,
  IconBrandAws,
  IconCloud,
  IconDatabase,
  IconMessageCircle,
  IconServer,
  IconShieldLock,
  IconTrash,
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface ExternalServiceNodeData {
  externalService: ExternalService
  onDelete?: () => void
  [key: string]: unknown
}

export type ExternalServiceNodeType = Node<ExternalServiceNodeData, 'external'>

const typeIcons: Record<ExternalServiceType, typeof IconCloud> = {
  api: IconApi,
  database: IconDatabase,
  storage: IconBrandAws,
  cdn: IconServer,
  auth: IconShieldLock,
  messaging: IconMessageCircle,
  other: IconCloud,
}

const typeLabels: Record<ExternalServiceType, string> = {
  api: 'API',
  database: 'Database',
  storage: 'Storage',
  cdn: 'CDN',
  auth: 'Auth',
  messaging: 'Messaging',
  other: 'Other',
}

export function ExternalServiceNode({ data, selected }: NodeProps<ExternalServiceNodeType>) {
  const [isHovered, setIsHovered] = useState(false)
  const { externalService, onDelete } = data

  const type = externalService.type as ExternalServiceType
  const Icon = typeIcons[type] || IconCloud

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
          'w-[180px] border-slate-500/30 bg-slate-500/5 border-dashed',
          selected && 'ring-2 ring-slate-500',
        )}
      >
        <BaseNodeHeader className="bg-slate-500/10">
          <div className="flex items-center gap-2">
            <Icon className="size-4 text-slate-500" />
            <BaseNodeHeaderTitle className="text-sm">{externalService.name}</BaseNodeHeaderTitle>
          </div>
        </BaseNodeHeader>

        <BaseNodeContent className="pt-0 space-y-1">
          <p className="truncate text-xs text-muted-foreground font-mono">
            {externalService.host}
            {externalService.port ? `:${externalService.port}` : ''}
          </p>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-500/30">
              {typeLabels[type]}
            </Badge>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              External
            </Badge>
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
            <TooltipContent>Remove external service</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}
