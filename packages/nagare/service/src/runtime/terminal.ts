import { CONTAINER_BIN } from './constants'

export interface TerminalSession {
  /** Feed a raw line (without trailing newline) to the shell. */
  send(line: string): void
  /** Kill the shell + its exec. */
  kill(): void
}

/**
 * Open an interactive shell inside a running container and stream its output.
 *
 * Apple `container exec -it` needs a real TTY, which Bun.spawn can't provide
 * (its stdio is a pipe/socket), so we use `-i` only: a persistent shell with
 * stdin kept open — `cd`/env state survives across commands and ANSI colors
 * pass through. There's no PTY, so line-editing + echo are handled by the
 * caller (the ws cooked shim); full-screen apps (vim/htop) won't render.
 */
export function openContainerTerminal(
  containerId: string,
  onData: (chunk: string) => void,
  onExit: () => void,
): TerminalSession {
  const proc = Bun.spawn([CONTAINER_BIN, 'exec', '-i', containerId, 'sh'], {
    stdin: 'pipe',
    stdout: 'pipe',
    stderr: 'pipe',
  })

  const decoder = new TextDecoder()
  const pump = async (stream: ReadableStream<Uint8Array>) => {
    const reader = stream.getReader()
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      if (value) onData(decoder.decode(value))
    }
  }
  void pump(proc.stdout)
  void pump(proc.stderr)
  void proc.exited.then(onExit)

  const stdin = proc.stdin

  return {
    send(line: string) {
      stdin.write(`${line}\n`)
      void stdin.flush()
    },
    kill() {
      try {
        stdin.end()
      } catch {
        // already closed
      }
      try {
        proc.kill()
      } catch {
        // already exited
      }
    },
  }
}
