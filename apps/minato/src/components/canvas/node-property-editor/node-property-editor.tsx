import { IconX } from '@tabler/icons-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DatabaseProperties } from './database-properties'
import type { NodePropertyEditorProps } from './lib'
import { ServiceProperties } from './service-properties'

export function NodePropertyEditor({
  service,
  database,
  nodeType,
  onClose,
  onAction,
  isActionPending,
}: NodePropertyEditorProps) {
  const entityName =
    nodeType === 'service'
      ? (service?.name ?? 'service')
      : nodeType === 'database'
        ? (database?.name ?? 'database')
        : 'node'

  return (
    <div className="flex h-full flex-col font-mono">
      {/* Header with traffic-light dots */}
      <div className="group flex items-center gap-2 border-b border-neutral-800 px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-800 transition-colors group-hover:bg-red-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-800 transition-colors group-hover:bg-yellow-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-800 transition-colors group-hover:bg-green-500" />
        </div>
        <span className="flex-1 text-[11px] text-neutral-600">{entityName}.properties</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-neutral-600 transition-colors hover:text-neutral-400"
        >
          <IconX className="size-3" />
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {service && (
            <ServiceProperties
              service={service}
              onAction={onAction}
              isActionPending={isActionPending}
            />
          )}
          {database && (
            <DatabaseProperties
              database={database}
              onAction={onAction}
              isActionPending={isActionPending}
            />
          )}
          {!service && !database && (
            <div className="py-8 text-center text-[10px] text-neutral-700">
              $ no properties available
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
