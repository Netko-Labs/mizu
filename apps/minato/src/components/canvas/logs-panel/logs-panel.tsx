import { IconArrowDown, IconX } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { databaseQueries, logQueries, serviceQueries } from '@/shared/api'

interface LogsPanelProps {
  serviceId?: string
  databaseId?: string
  entityName?: string
  onClose: () => void
}

export function LogsPanel({ serviceId, databaseId, entityName, onClose }: LogsPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // Get the containerId from the service or database
  const { data: service } = useQuery({
    ...serviceQueries.byId(serviceId ?? ''),
    enabled: !!serviceId,
  })

  const { data: database } = useQuery({
    ...databaseQueries.byId(databaseId ?? ''),
    enabled: !!databaseId,
  })

  const containerId = serviceId ? service?.containerId : database?.containerId

  // Fetch logs
  const { data: logs, isLoading } = useQuery({
    ...logQueries.byContainer(containerId ?? '', 200),
    enabled: !!containerId,
    refetchInterval: 3000,
  })

  // Auto-scroll to bottom
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run on every new logs payload to stick to the bottom
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
    setAutoScroll(isAtBottom)
  }, [])

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      setAutoScroll(true)
    }
  }, [])

  const logLines = logs?.split('\n').filter(Boolean) ?? []

  return (
    <div className="flex h-full flex-col border-t border-neutral-800 bg-black/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-600"># logs</span>
          {entityName && (
            <span className="rounded border border-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-500">
              {entityName}
            </span>
          )}
          {!containerId && <span className="text-[10px] text-neutral-600">no container</span>}
        </div>
        <div className="flex items-center gap-1">
          {!autoScroll && (
            <button
              type="button"
              onClick={scrollToBottom}
              className="rounded p-1 text-neutral-600 transition-colors hover:bg-neutral-800 hover:text-neutral-400"
              title="Jump to bottom"
            >
              <IconArrowDown className="size-3" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-neutral-600 transition-colors hover:bg-neutral-800 hover:text-neutral-400"
          >
            <IconX className="size-3" />
          </button>
        </div>
      </div>

      {/* Log content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto p-2 font-mono text-[11px] leading-relaxed"
      >
        {isLoading && <div className="text-neutral-600">Loading logs...</div>}
        {!isLoading && !containerId && (
          <div className="text-neutral-600">No container found. Deploy first to see logs.</div>
        )}
        {!isLoading && containerId && logLines.length === 0 && (
          <div className="text-neutral-600">No logs yet.</div>
        )}
        {logLines.map((line, i) => {
          // Simple heuristic: lines with ERROR, FATAL, panic are errors
          const isError = /error|fatal|panic|exception|fail/i.test(line) || line.includes('stderr')
          return (
            <div
              key={`${i}-${line.slice(0, 20)}`}
              className={`whitespace-pre-wrap break-all ${isError ? 'text-red-400/80' : 'text-neutral-400'}`}
            >
              {line}
            </div>
          )
        })}
      </div>
    </div>
  )
}
