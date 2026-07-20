import type { Service } from '@mizu/nagare-domain'
import type { RefObject } from 'react'
import type { Serialized } from '@/shared/api'

export interface ConsoleTabProps {
  service: Serialized<Service>
}

export interface ConsoleEntry {
  id: number
  command: string
  stdout: string
  stderr: string
  exitCode: number | null
  timedOut: boolean
  pending: boolean
}

export interface UseConsoleResult {
  entries: ConsoleEntry[]
  command: string
  setCommand: (command: string) => void
  submit: () => void
  scrollRef: RefObject<HTMLDivElement | null>
  isRunning: boolean
  clear: () => void
}
