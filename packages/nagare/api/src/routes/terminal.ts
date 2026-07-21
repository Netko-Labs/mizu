import { TerminalQuerySchema } from '@mizu/nagare-domain'
import {
  assertServiceOwned,
  getService,
  openContainerTerminal,
  type TerminalSession,
  verifyToken,
} from '@mizu/nagare-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'
import { TerminalLineEditor } from '../shared/terminal-line-editor'

interface Session {
  terminal: TerminalSession
  editor: TerminalLineEditor
  idleTimer?: ReturnType<typeof setTimeout>
}

/**
 * A session that outlives its tab (or hangs against a dead container VM) would
 * otherwise leak its `container exec` forever — close it after this long
 * without a keystroke.
 */
const IDLE_TIMEOUT_MS = 20 * 60_000

// Keyed on the client-supplied `cid` (Elysia 2's ws.id is unreliable).
const sessions = new Map<string, Session>()

function armIdleTimer(session: Session, ws: { send(data: string): void; close(): void }): void {
  clearTimeout(session.idleTimer)
  session.idleTimer = setTimeout(() => {
    ws.send('\r\n\x1b[90m[session closed after 20 minutes of inactivity]\x1b[0m\r\n')
    ws.close()
  }, IDLE_TIMEOUT_MS)
}

/**
 * Interactive shell over WebSocket for the drawer's Console (wterm frontend).
 * There's no container-side PTY (see runtime/terminal.ts), so a line editor
 * cooks keystrokes here (echo, backspace, history, escape-sequence handling)
 * and forwards whole lines to the shell on Enter. Shell output streams back
 * with LF normalized to CRLF for the terminal (ANSI colors preserved).
 */
export const terminalRoutes = new Elysia({ name: 'terminal' })
  .use(authPlugin)
  .ws('/services/terminal', {
    query: TerminalQuerySchema,
    async open(ws) {
      const { serviceId, token, cid } = ws.query

      const user = await verifyToken(token)
      if (!user) {
        ws.close(1008, 'Unauthorized')
        return
      }
      try {
        await assertServiceOwned(serviceId, user.organizationId)
      } catch {
        ws.close(1008, 'Forbidden')
        return
      }

      const service = await getService(serviceId)
      if (!service?.containerId || service.status !== 'running') {
        ws.send('\r\n\x1b[31mService is not running — start it to open a shell.\x1b[0m\r\n')
        ws.close(1011, 'Not running')
        return
      }

      const terminal = openContainerTerminal(
        service.containerId,
        (chunk) => ws.send(chunk.replace(/\r?\n/g, '\r\n')),
        () => {
          ws.send('\r\n\x1b[90m[session ended]\x1b[0m\r\n')
          ws.close(1000, 'Shell exited')
        },
      )
      const editor = new TerminalLineEditor({
        echo: (data) => ws.send(data),
        submit: (line) => terminal.send(line),
      })
      const session: Session = { terminal, editor }
      armIdleTimer(session, ws)
      sessions.set(cid, session)
      ws.send(
        '\x1b[90mConnected — interactive sh (no PTY: full-screen apps unsupported)\x1b[0m\r\n',
      )
    },
    message(ws, message) {
      const session = sessions.get(ws.query.cid)
      if (!session) return
      armIdleTimer(session, ws)
      session.editor.feed(typeof message === 'string' ? message : String(message))
    },
    close(ws) {
      const session = sessions.get(ws.query.cid)
      if (session) {
        clearTimeout(session.idleTimer)
        session.terminal.kill()
        sessions.delete(ws.query.cid)
      }
    },
  })
