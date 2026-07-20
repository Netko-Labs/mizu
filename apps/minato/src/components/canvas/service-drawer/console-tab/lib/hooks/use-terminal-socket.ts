import { useCallback, useEffect, useRef, useState } from 'react'
import { connectServiceTerminal } from '@/integrations/nagare'
import type { TerminalStatus, UseTerminalSocketOptions, UseTerminalSocketResult } from '../types'

const RECONNECT_MS = 2_000

/**
 * Bridges a wterm <Terminal> to the nagare cooked-shell WebSocket: shell output
 * is written into the terminal handle, keystrokes are sent back raw. Connects
 * only while `enabled`, retries an unexpected close once the tab is still live,
 * and tears everything down on unmount.
 */
export function useTerminalSocket({
  serviceId,
  enabled,
  handleRef,
}: UseTerminalSocketOptions): UseTerminalSocketResult {
  const [status, setStatus] = useState<TerminalStatus>('idle')
  const wsRef = useRef<WebSocket | null>(null)
  const [attempt, setAttempt] = useState(0)

  // biome-ignore lint/correctness/useExhaustiveDependencies: `attempt` is a bump counter that re-runs the effect to reconnect after a drop
  useEffect(() => {
    if (!enabled) {
      setStatus('idle')
      return
    }
    let cancelled = false
    let socket: WebSocket | null = null
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    setStatus('connecting')

    connectServiceTerminal(serviceId).then((ws) => {
      if (cancelled || !ws) {
        if (!cancelled) setStatus('closed')
        return
      }
      socket = ws
      wsRef.current = ws
      ws.onopen = () => {
        setStatus('open')
        handleRef.current?.focus()
      }
      ws.onmessage = (event: MessageEvent) => {
        if (typeof event.data === 'string') handleRef.current?.write(event.data)
      }
      const onDown = () => {
        setStatus('closed')
        wsRef.current = null
        if (!cancelled) retryTimer = setTimeout(() => setAttempt((a) => a + 1), RECONNECT_MS)
      }
      ws.onclose = onDown
      ws.onerror = onDown
    })

    return () => {
      cancelled = true
      if (retryTimer) clearTimeout(retryTimer)
      socket?.close()
      wsRef.current = null
    }
  }, [serviceId, enabled, attempt, handleRef])

  const onData = useCallback((data: string) => {
    wsRef.current?.send(data)
  }, [])

  return { status, onData }
}
