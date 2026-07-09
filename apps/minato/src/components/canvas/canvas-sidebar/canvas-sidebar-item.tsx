import type { DragEvent } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DraggableItemProps, ServiceItemCardProps } from './lib/types'

/**
 * A draggable item component that can be dropped onto the canvas.
 * Also supports click-to-add as a reliable alternative to drag-and-drop.
 */
export function DraggableItem({ type, data, children, onClick }: DraggableItemProps) {
  const onDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/reactflow-type', type)
    e.dataTransfer.setData('application/reactflow-data', JSON.stringify(data))
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.()
      }}
      className="cursor-pointer active:cursor-grabbing"
    >
      {children}
    </div>
  )
}

/**
 * Card component for sidebar items
 */
export function ServiceItemCard({ name, description, className }: ServiceItemCardProps) {
  return (
    <Card
      className={cn(
        'border-neutral-800 bg-neutral-950 p-3 transition-all hover:border-neutral-700 hover:bg-neutral-900',
        className,
      )}
    >
      <div className="text-xs font-medium text-neutral-300">{name}</div>
      <div className="text-[10px] text-neutral-600 line-clamp-2">{description}</div>
    </Card>
  )
}
