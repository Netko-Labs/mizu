import { IconBoxMultiple } from '@tabler/icons-react'
import { type Node, type NodeProps, NodeResizer } from '@xyflow/react'
import type { CSSProperties } from 'react'
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/components/canvas/shared/base-node'
import { cn } from '@/lib/utils'

export interface ServiceGroupNodeData {
  group: {
    id: string
    name: string
    color?: string
  }
  memberCount: number
  [key: string]: unknown
}

export type ServiceGroupNodeType = Node<ServiceGroupNodeData, 'service-group'>

export function ServiceGroupNode({ data, selected }: NodeProps<ServiceGroupNodeType>) {
  const accent = data.group.color ?? '#3B82F6'

  return (
    <BaseNode
      className={cn(
        'h-full w-full rounded-2xl border border-dashed bg-gradient-to-b from-[#0B1220]/60 to-[#04070E]/40 shadow-none',
        selected && 'border-solid',
      )}
      style={
        {
          borderColor: `${accent}55`,
          boxShadow: selected ? `0 0 0 1px ${accent}66 inset` : undefined,
        } as CSSProperties
      }
    >
      <NodeResizer
        isVisible
        minWidth={420}
        minHeight={260}
        color={accent}
        handleClassName="!h-3 !w-3 !rounded-sm !border-0 !bg-blue-400"
        lineClassName="!border-blue-400/50"
      />
      <BaseNodeHeader className="border-b border-white/5 pb-2 pt-2">
        <div
          className="flex size-7 items-center justify-center rounded-md"
          style={{ backgroundColor: `${accent}1A`, color: accent }}
        >
          <IconBoxMultiple className="size-4" />
        </div>
        <BaseNodeHeaderTitle className="text-xs">{data.group.name}</BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent className="pb-2 pt-1.5">
        <span className="text-[10px] text-neutral-500">
          {data.memberCount} {data.memberCount === 1 ? 'node' : 'nodes'}
        </span>
      </BaseNodeContent>
    </BaseNode>
  )
}
