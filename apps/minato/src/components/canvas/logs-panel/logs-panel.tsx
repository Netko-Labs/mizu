import { IconX } from '@tabler/icons-react'
import { LogViewer } from '@/components/canvas/shared'

interface LogsPanelProps {
  serviceId?: string
  databaseId?: string
  entityName?: string
  onClose: () => void
}

/** The project-level bottom log tail — a header over the shared LogViewer. */
export function LogsPanel({ serviceId, databaseId, entityName, onClose }: LogsPanelProps) {
  return (
    <div className="flex h-full flex-col border-t border-neutral-800 bg-black/95 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-neutral-800 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-500">Logs</span>
          {entityName && (
            <span className="rounded border border-neutral-800 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500">
              {entityName}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-neutral-600 transition-colors hover:bg-neutral-800 hover:text-neutral-400"
        >
          <IconX className="size-3" />
        </button>
      </div>
      <LogViewer serviceId={serviceId} databaseId={databaseId} />
    </div>
  )
}
