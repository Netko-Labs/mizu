import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { execServiceCommand } from '@/shared/api'
import type { ConsoleEntry, UseConsoleResult } from '../types'

/**
 * Scrollback of one-shot exec runs plus the input draft and stick-to-bottom
 * scrolling. Each command appends a pending entry that fills in (or errors)
 * when the daemon responds. Client-side only — history resets on close.
 */
export function useConsole(serviceId: string): UseConsoleResult {
  const [entries, setEntries] = useState<ConsoleEntry[]>([])
  const [command, setCommand] = useState('')
  const nextId = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: stick to the bottom on new output
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [entries])

  const mutation = useMutation({
    mutationFn: ({ command: cmd }: { id: number; command: string }) =>
      execServiceCommand({ serviceId, command: cmd }),
    onSuccess: (result, { id }) => {
      setEntries((prev) =>
        prev.map((entry) => (entry.id === id ? { ...entry, ...result, pending: false } : entry)),
      )
    },
    onError: (error, { id }) => {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === id
            ? { ...entry, stderr: error.message, exitCode: -1, pending: false }
            : entry,
        ),
      )
    },
  })

  const submit = () => {
    const cmd = command.trim()
    if (!cmd) return
    const id = nextId.current++
    setEntries((prev) => [
      ...prev,
      { id, command: cmd, stdout: '', stderr: '', exitCode: null, timedOut: false, pending: true },
    ])
    mutation.mutate({ id, command: cmd })
    setCommand('')
  }

  return {
    entries,
    command,
    setCommand,
    submit,
    scrollRef,
    isRunning: mutation.isPending,
    clear: () => setEntries([]),
  }
}
