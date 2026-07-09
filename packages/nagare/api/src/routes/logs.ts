import type { LogStreamEvent } from '@mizu/nagare-domain'
import { LogQuerySchema, LogStreamQuerySchema } from '@mizu/nagare-domain'
import {
  getContainerLogs,
  getDatabase,
  getService,
  streamContainerLogs,
  streamHub,
  verifyToken,
} from '@mizu/nagare-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

async function resolveContainerId(query: {
  serviceId?: string
  databaseId?: string
}): Promise<string | null> {
  if (query.serviceId) {
    const service = await getService(query.serviceId)
    return service?.containerId ?? null
  }
  if (query.databaseId) {
    const database = await getDatabase(query.databaseId)
    return database?.containerId ?? null
  }
  return null
}

/**
 * Container logs: a plain HTTP tail plus a live WebSocket stream. WS auth rides
 * `?token=` (minato JWT) and each connection carries a unique client-generated
 * `?cid=` — Elysia 2's `ws.id` is unreliable, so the hub keys streams on it.
 * Events go out as JSON strings typed by `LogStreamEvent`.
 */
export const logsRoutes = new Elysia({ name: 'logs' })
  .use(authPlugin)
  // 📜 last N lines over HTTP
  .get('/logs/:containerId', { auth: true, query: LogQuerySchema }, ({ params, query }) =>
    getContainerLogs(params.containerId, query.tail),
  )
  // (づ￣ ³￣)づ live log stream over WS
  .ws('/logs/stream', {
    query: LogStreamQuerySchema,
    // (｡•̀ᴗ-)✧ a viewer connects — auth, resolve the container, start streaming
    async open(ws) {
      const send = (event: LogStreamEvent) => ws.send(JSON.stringify(event))

      const user = await verifyToken(ws.query.token)
      if (!user) {
        ws.close(1008, 'Unauthorized')
        return
      }

      const containerId = await resolveContainerId(ws.query)
      if (!containerId) {
        send({ type: 'error', error: 'No container found' })
        ws.close(1011, 'No container found')
        return
      }

      const controller = streamHub.register(ws.query.cid)
      try {
        for await (const entry of streamContainerLogs(containerId, {
          signal: controller.signal,
        })) {
          if (controller.signal.aborted) break
          send({
            type: 'log',
            timestamp: entry.timestamp.toISOString(),
            stream: entry.stream,
            message: entry.message,
          })
        }
        if (!controller.signal.aborted) send({ type: 'end' })
      } catch (error) {
        if (!controller.signal.aborted) {
          send({ type: 'error', error: error instanceof Error ? error.message : String(error) })
        }
      }
    },
    // (｡•́︿•̀｡) viewer leaves — abort their docker stream
    close(ws) {
      streamHub.release(ws.query.cid)
    },
  })
