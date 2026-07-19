import { IconArrowDown } from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { type LogViewerProps, useLogStream } from './lib'

/**
 * The shared log tail: auto-scroll with stick-to-bottom detection, error-line
 * highlighting, jump-to-bottom affordance. Rendered by both the bottom logs
 * panel and the service drawer's Logs tab.
 */
export function LogViewer({ serviceId, databaseId, className }: LogViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const { containerId, logLines, isLoading } = useLogStream({ serviceId, databaseId })

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run on every new logs payload to stick to the bottom
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logLines, autoScroll])

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 50)
  }, [])

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      setAutoScroll(true)
    }
  }, [])

  return (
    <div className={cn('relative flex min-h-0 flex-1 flex-col', className)}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto p-2 font-mono text-[11px] leading-relaxed"
      >
        {isLoading && <div className="text-muted-foreground">Loading logs…</div>}
        {!isLoading && !containerId && (
          <div className="text-muted-foreground">No container yet — deploy first to see logs.</div>
        )}
        {!isLoading && containerId && logLines.length === 0 && (
          <div className="text-muted-foreground">No logs yet.</div>
        )}
        {logLines.map((line, i) => {
          const isError = /error|fatal|panic|exception|fail/i.test(line) || line.includes('stderr')
          return (
            <div
              key={`${i}-${line.slice(0, 20)}`}
              className={cn(
                'whitespace-pre-wrap break-all',
                isError ? 'text-red-400/80' : 'text-neutral-400',
              )}
            >
              {line}
            </div>
          )
        })}
      </div>
      {!autoScroll && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute right-3 bottom-3 rounded-full border border-border bg-background/90 p-1.5 text-muted-foreground shadow transition-colors hover:text-foreground"
          title="Jump to bottom"
        >
          <IconArrowDown className="size-3.5" />
        </button>
      )}
    </div>
  )
}
