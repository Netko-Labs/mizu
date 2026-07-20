import type { Service } from '@mizu/nagare-domain'
import type { TerminalHandle } from '@wterm/react'
import type { RefObject } from 'react'
import type { Serialized } from '@/shared/api'

export interface ConsoleTabProps {
  service: Serialized<Service>
}

export type TerminalStatus = 'idle' | 'connecting' | 'open' | 'closed'

export interface UseTerminalSocketOptions {
  serviceId: string
  /** Only connect while the container is running and the widget is mounted. */
  enabled: boolean
  /** The mounted <Terminal>'s imperative handle. */
  handleRef: RefObject<TerminalHandle | null>
}

export interface UseTerminalSocketResult {
  status: TerminalStatus
  /** Pass to <Terminal onData> — forwards keystrokes to the shell. */
  onData: (data: string) => void
}
