import { treaty } from '@elysiajs/eden'
import type { App as NagareApp } from '@mizu/nagare-api'
import type { LogsStreamTarget, TokenResponse } from './lib'

function getNagareUrl(): string {
  return import.meta.env.VITE_NAGARE_URL ?? 'http://localhost:3001'
}

/**
 * Fetch a fresh JWT for the current session (minato mints it via the jwt
 * plugin). Window-relative and cookie-bound, so it is browser-only — during
 * SSR it returns null and nagare calls stay unauthenticated.
 */
export async function getNagareToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  try {
    const res = await fetch('/api/auth/token', { credentials: 'include' })
    if (!res.ok) return null
    const { token } = (await res.json()) as TokenResponse
    return token ?? null
  } catch {
    return null
  }
}

/**
 * Eden Treaty client for the nagare daemon's HTTP API. A fresh Bearer JWT is
 * attached to every request when signed in. Components never import this
 * directly — data access goes through `@/shared/api`.
 */
export const nagare = treaty<NagareApp>(getNagareUrl(), {
  headers: async () => {
    const token = await getNagareToken()
    return token ? { authorization: `Bearer ${token}` } : {}
  },
})

/**
 * Open a native WebSocket to the container log stream. Auth rides the
 * `?token=` query param, and a unique `?cid=` identifies this connection
 * server-side (Elysia 2's `ws.id` is unreliable, so the client supplies a
 * stable per-connection id).
 */
export async function connectLogsStream(target: LogsStreamTarget): Promise<WebSocket | null> {
  const token = await getNagareToken()
  if (!token) return null
  const wsUrl = getNagareUrl().replace(/^http/, 'ws')
  const cid = crypto.randomUUID()
  const params = new URLSearchParams({ token, cid })
  if (target.serviceId) params.set('serviceId', target.serviceId)
  if (target.databaseId) params.set('databaseId', target.databaseId)
  return new WebSocket(`${wsUrl}/logs/stream?${params.toString()}`)
}

/**
 * Open a native WebSocket to a service's interactive container shell. Mirrors
 * `connectLogsStream`: auth rides `?token=`, a unique `?cid=` identifies the
 * connection server-side, and the backend runs a cooked `sh` — the client
 * sends raw keystrokes and writes back the ANSI output it streams.
 */
export async function connectServiceTerminal(serviceId: string): Promise<WebSocket | null> {
  const token = await getNagareToken()
  if (!token) return null
  const wsUrl = getNagareUrl().replace(/^http/, 'ws')
  const cid = crypto.randomUUID()
  const params = new URLSearchParams({ token, cid, serviceId })
  return new WebSocket(`${wsUrl}/services/terminal?${params.toString()}`)
}
