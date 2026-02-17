import { IconArrowDown, IconSearch, IconTrash } from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export interface LogEntry {
  id: string
  timestamp: Date
  message: string
  stream: 'stdout' | 'stderr'
}

export interface LogsViewerProps {
  /** Service ID for fetching service logs */
  serviceId?: string
  /** Database ID for fetching database logs */
  databaseId?: string
  /** Initial logs to display */
  initialLogs?: LogEntry[]
  /** Callback when logs are cleared */
  onClear?: () => void
  /** Maximum number of log entries to keep */
  maxEntries?: number
  /** Height of the logs viewer */
  height?: string | number
  /** Custom class name */
  className?: string
}

/**
 * Format a timestamp for display
 */
function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  })
}

/**
 * Real-time log viewer component
 * Features:
 * - Auto-scroll to bottom
 * - Timestamp display
 * - stdout/stderr color coding
 * - Search/filter functionality
 * - Clear button
 */
export function LogsViewer({
  serviceId: _serviceId,
  databaseId: _databaseId,
  initialLogs = [],
  onClear,
  maxEntries: _maxEntries = 1000,
  height = 300,
  className,
}: LogsViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs)
  const [searchQuery, setSearchQuery] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Filter logs based on search query
  const filteredLogs = searchQuery.trim()
    ? logs.filter((log) => log.message.toLowerCase().includes(searchQuery.toLowerCase()))
    : logs

  // Scroll to bottom when new logs arrive (if auto-scroll is enabled)
  // biome-ignore lint/correctness/useExhaustiveDependencies: logs is intentionally a trigger dependency
  useEffect(() => {
    if (autoScroll && !isUserScrolling && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll, isUserScrolling])

  // Handle scroll events to detect user scrolling
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const isAtBottom = Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 50
    setAutoScroll(isAtBottom)
    setIsUserScrolling(!isAtBottom)
  }, [])

  // Scroll to bottom manually
  const scrollToBottom = useCallback(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
      setAutoScroll(true)
      setIsUserScrolling(false)
    }
  }, [])

  // Clear logs
  const handleClear = useCallback(() => {
    setLogs([])
    onClear?.()
  }, [onClear])

  /**
   * TODO: Subscribe to log stream via tRPC when serviceId or databaseId is provided
   *
   * Implementation will use tRPC subscriptions for real-time log streaming.
   * Example implementation:
   *
   * ```typescript
   * const addLog = useCallback((entry: Omit<LogEntry, 'id'>) => {
   *   setLogs((prev) => {
   *     const newLogs = [...prev, { ...entry, id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}` }]
   *     return newLogs.length > maxEntries ? newLogs.slice(-maxEntries) : newLogs
   *   })
   * }, [maxEntries])
   *
   * useEffect(() => {
   *   if (!serviceId && !databaseId) return
   *   const unsubscribe = trpcClient.logs.stream.subscribe(
   *     { serviceId, databaseId },
   *     { onData: addLog, onError: console.error }
   *   )
   *   return () => unsubscribe.unsubscribe()
   * }, [serviceId, databaseId, addLog])
   * ```
   */

  return (
    <div className={cn('flex flex-col', className)} style={{ height }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
        <div className="relative flex-1">
          <IconSearch className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 pl-7 text-xs"
          />
        </div>
        <Button variant="ghost" size="icon-xs" onClick={handleClear} title="Clear logs">
          <IconTrash className="size-3.5" />
        </Button>
        {!autoScroll && (
          <Button variant="ghost" size="icon-xs" onClick={scrollToBottom} title="Scroll to bottom">
            <IconArrowDown className="size-3.5" />
          </Button>
        )}
      </div>

      {/* Log entries */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 bg-[#0d1117]" onScroll={handleScroll}>
        <div className="p-2 font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">
              {searchQuery ? 'No matching logs found' : 'No logs yet'}
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className={cn(
                  'flex gap-2 py-0.5 hover:bg-white/5',
                  log.stream === 'stderr' && 'text-red-400',
                )}
              >
                <span className="text-muted-foreground shrink-0 select-none">
                  {formatTimestamp(log.timestamp)}
                </span>
                <span
                  className={cn(
                    'break-all',
                    log.stream === 'stdout' && 'text-gray-300',
                    log.stream === 'stderr' && 'text-red-400',
                  )}
                >
                  {log.message}
                </span>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Status bar */}
      <div className="flex items-center justify-between px-2 py-1 border-t bg-muted/30 text-xs text-muted-foreground">
        <span>
          {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
          {searchQuery && ` (filtered from ${logs.length})`}
        </span>
        {autoScroll && (
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        )}
      </div>
    </div>
  )
}
