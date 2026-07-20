import { IconChevronRight, IconTrash } from '@tabler/icons-react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { useConsole } from './lib'
import type { ConsoleTabProps } from './lib/types'

/**
 * One-shot command console: each line runs `sh -lc` inside the running
 * container and prints both streams + exit code. Not an interactive TTY —
 * every command starts a fresh shell.
 */
export function ConsoleTab({ service }: ConsoleTabProps) {
  const { entries, command, setCommand, submit, scrollRef, isRunning, clear } = useConsole(
    service.id,
  )
  const running = service.status === 'running'

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-auto p-3 font-mono text-[11px]">
        {entries.length === 0 && (
          <div className="py-6 text-center font-sans text-xs text-muted-foreground">
            {running
              ? 'Run a command inside the container — each line starts a fresh sh.'
              : 'The console needs a running container.'}
          </div>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className="mb-2">
            <div className="flex items-center gap-1 text-primary">
              <IconChevronRight className="size-3 shrink-0" />
              <span className="break-all">{entry.command}</span>
              {entry.pending && <Spinner className="ml-1 size-2.5" />}
            </div>
            {entry.stdout && (
              <pre className="whitespace-pre-wrap break-all text-neutral-400">{entry.stdout}</pre>
            )}
            {entry.stderr && (
              <pre className="whitespace-pre-wrap break-all text-red-400/80">{entry.stderr}</pre>
            )}
            {!entry.pending && entry.exitCode !== null && entry.exitCode !== 0 && (
              <div className="text-[10px] text-muted-foreground">
                exit {entry.exitCode}
                {entry.timedOut ? ' (timed out)' : ''}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-border px-3 py-2">
        <IconChevronRight
          className={cn('size-3.5', running ? 'text-primary' : 'text-muted-foreground')}
        />
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && running && submit()}
          placeholder={running ? 'ls -la /' : 'container not running'}
          disabled={!running || isRunning}
          className="min-w-0 flex-1 bg-transparent font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground/50 disabled:opacity-50"
        />
        {entries.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="shrink-0 text-muted-foreground/60 transition-colors hover:text-foreground"
            title="Clear scrollback"
          >
            <IconTrash className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
