/** Matches the PS1 the terminal route sets on the container shell. */
export const TERMINAL_PROMPT = '$ '

export interface TerminalLineEditorSinks {
  /** Write straight back to the client terminal (echo, redraws). */
  echo(data: string): void
  /** Submit a finished line (without newline) to the shell. */
  submit(line: string): void
}

/**
 * A minimal line discipline for the no-PTY console. The container shell runs
 * behind a pipe, so nothing echoes and arrow keys arrive as raw ANSI escape
 * sequences — this cooks keystrokes into lines: echo, backspace, Ctrl-C/U,
 * ↑/↓ history (escape sequences are otherwise swallowed, never buffered).
 */
export class TerminalLineEditor {
  private buffer = ''
  private history: string[] = []
  private historyIndex = 0
  private escape: 'none' | 'esc' | 'csi' = 'none'
  private lastWasCR = false

  constructor(private sinks: TerminalLineEditorSinks) {}

  feed(input: string): void {
    for (const char of input) this.feedChar(char)
  }

  private feedChar(char: string): void {
    // \r\n from a client Enter is one submit, not two.
    const afterCR = this.lastWasCR
    this.lastWasCR = char === '\r'
    if (char === '\n' && afterCR) return

    if (this.escape !== 'none') {
      this.feedEscapeChar(char)
      return
    }

    if (char === '\x1b') {
      this.escape = 'esc'
    } else if (char === '\r' || char === '\n') {
      this.sinks.echo('\r\n')
      this.pushHistory(this.buffer)
      this.sinks.submit(this.buffer)
      this.buffer = ''
    } else if (char === '\x7f' || char === '\x08') {
      if (this.buffer.length > 0) {
        this.buffer = this.buffer.slice(0, -1)
        this.sinks.echo('\b \b')
      }
    } else if (char === '\x03') {
      // Ctrl-C: abandon the line; submit nothing so the shell re-prompts.
      this.sinks.echo('^C\r\n')
      this.buffer = ''
      this.historyIndex = this.history.length
      this.sinks.submit('')
    } else if (char === '\x15') {
      // Ctrl-U: clear the line.
      this.buffer = ''
      this.redraw()
    } else if (char >= ' ') {
      this.buffer += char
      this.sinks.echo(char)
    }
    // Remaining control chars (Tab, Ctrl-D, …) are swallowed: no completion,
    // and EOF over the pipe would kill the whole session.
  }

  private feedEscapeChar(char: string): void {
    if (this.escape === 'esc') {
      // '[' opens CSI, 'O' opens SS3 — both end on a final byte below.
      this.escape = char === '[' || char === 'O' ? 'csi' : 'none'
      return
    }
    // CSI: parameter bytes (0-9;<=>?) are below '@'; the final byte ends it.
    if (char < '@') return
    this.escape = 'none'
    if (char === 'A') this.historyStep(-1)
    else if (char === 'B') this.historyStep(1)
    // ←/→ and everything else: swallowed (no in-line cursor movement).
  }

  private pushHistory(line: string): void {
    const trimmed = line.trim()
    if (trimmed && this.history[this.history.length - 1] !== trimmed) {
      this.history.push(trimmed)
    }
    this.historyIndex = this.history.length
  }

  private historyStep(direction: -1 | 1): void {
    const next = this.historyIndex + direction
    if (next < 0 || next > this.history.length) return
    this.historyIndex = next
    this.buffer = this.history[next] ?? ''
    this.redraw()
  }

  private redraw(): void {
    this.sinks.echo(`\r\x1b[2K${TERMINAL_PROMPT}${this.buffer}`)
  }
}
