import { Terminal, type TerminalHandle } from '@wterm/react'
import '@wterm/react/css'
import { useRef } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { useMounted, useTerminalSocket } from './lib'
import type { ConsoleTabProps } from './lib/types'

/**
 * An interactive container shell over the nagare cooked-terminal WebSocket.
 * wterm is a client DOM + WASM widget, so it renders only after mount; the
 * shell is available while the service is running.
 */
export function ConsoleTab({ service }: ConsoleTabProps) {
  const running = service.status === 'running'
  const mounted = useMounted()
  const handleRef = useRef<TerminalHandle | null>(null)
  const { status, onData } = useTerminalSocket({
    serviceId: service.id,
    enabled: running && mounted,
    handleRef,
  })

  if (!running) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-xs text-muted-foreground">
        Start the service to open a shell.
      </div>
    )
  }

  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center gap-2 p-6 text-xs text-muted-foreground">
        <Spinner className="size-3" /> Preparing terminal…
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-[#0d1117]">
      <div className="min-h-0 flex-1 overflow-hidden p-2">
        <Terminal ref={handleRef} onData={onData} autoResize cursorBlink className="h-full" />
      </div>
      {status !== 'open' && (
        <div className="border-t border-border px-3 py-1 text-[10px] text-muted-foreground">
          {status === 'connecting'
            ? 'Connecting…'
            : status === 'closed'
              ? 'Disconnected — reconnecting…'
              : 'Idle'}
        </div>
      )}
    </div>
  )
}
