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

interface Session {
  terminal: TerminalSession
  /** Current unsubmitted line (no PTY, so we cook it here). */
  buffer: string
}

// Keyed on the client-supplied `cid` (Elysia 2's ws.id is unreliable).
const sessions = new Map<string, Session>()

/**
 * Interactive shell over WebSocket for the drawer's Console (wterm frontend).
 * There's no container-side PTY (see runtime/terminal.ts), so this cooks the
 * line locally: echo keystrokes, handle backspace/Ctrl-C, and forward the whole
 * line to the shell on Enter. Shell output streams back raw (ANSI preserved).
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
        (chunk) => ws.send(chunk),
        () => {
          ws.send('\r\n\x1b[90m[session ended]\x1b[0m\r\n')
          ws.close(1000, 'Shell exited')
        },
      )
      sessions.set(cid, { terminal, buffer: '' })
      ws.send(
        '\x1b[90mConnected — interactive sh (no PTY: full-screen apps unsupported)\x1b[0m\r\n',
      )
    },
    message(ws, message) {
      const session = sessions.get(ws.query.cid)
      if (!session) return
      const input = typeof message === 'string' ? message : String(message)

      for (const char of input) {
        if (char === '\r' || char === '\n') {
          ws.send('\r\n')
          session.terminal.send(session.buffer)
          session.buffer = ''
        } else if (char === '\x7f' || char === '\x08') {
          if (session.buffer.length > 0) {
            session.buffer = session.buffer.slice(0, -1)
            ws.send('\b \b')
          }
        } else if (char === '\x03') {
          // Ctrl-C: abandon the current line (can't signal the shell over a pipe)
          ws.send('^C\r\n')
          session.buffer = ''
        } else if (char >= ' ') {
          session.buffer += char
          ws.send(char)
        }
      }
    },
    close(ws) {
      const session = sessions.get(ws.query.cid)
      if (session) {
        session.terminal.kill()
        sessions.delete(ws.query.cid)
      }
    },
  })
