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
 * pass through. `sh -i` forces interactive mode so the shell prints its PS1
 * prompt (to stderr, which we pump) after every command; the prompt string is
 * pinned so the ws line editor can redraw it. There's no PTY, so line-editing
 * + echo are handled by the caller; full-screen apps (vim/htop) won't render.
 */
export function openContainerTerminal(
  containerId: string,
  onData: (chunk: string) => void,
  onExit: () => void,
): TerminalSession {
  const proc = Bun.spawn([CONTAINER_BIN, 'exec', '-e', 'PS1=$ ', '-i', containerId, 'sh', '-i'], {
    stdin: 'pipe',
    stdout: 'pipe',
    stderr: 'pipe',
  })

  let closed = false
  // Interactive sh without a tty warns once on startup — drop that line.
  let ttyWarningFiltered = false
  const decoder = new TextDecoder()
  const pump = async (stream: ReadableStream<Uint8Array>) => {
    const reader = stream.getReader()
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      // Drop late output after kill (the CLI emits a benign signal error).
      if (!value || closed) continue
      let chunk = decoder.decode(value)
      if (!ttyWarningFiltered && chunk.includes("can't access tty")) {
        chunk = chunk.replace(/^.*can't access tty.*\r?\n?/m, '')
        ttyWarningFiltered = true
        if (!chunk) continue
      }
      onData(chunk)
    }
  }
  void pump(proc.stdout)
  void pump(proc.stderr)
  void proc.exited.then(() => {
    if (!closed) onExit()
  })

  const stdin = proc.stdin

  return {
    send(line: string) {
      if (closed) return
      stdin.write(`${line}\n`)
      void stdin.flush()
    },
    kill() {
      closed = true
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
