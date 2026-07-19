import { createLogger } from '@mizu/logger'
import { app } from '@mizu/nagare-api'
import { nagareEnvConfig } from '@mizu/nagare-config'
import { ensureRuntimeRunning, startMetricsSampler, startSupervisor } from '@mizu/nagare-service'

const logger = createLogger('nagare')

// Boot order: container runtime first, then the supervisor (which heals any
// containers that should be running), then the HTTP/WS surface.
await ensureRuntimeRunning()
const supervisor = startSupervisor()
const metrics = startMetricsSampler()

// The full app (HTTP routes + the WebSocket log stream) lives in @mizu/nagare-api;
// the entry just starts the Bun server.
const server = app.listen(nagareEnvConfig.app.port)
logger.info(`🌊 nagare daemon flowing on http://localhost:${nagareEnvConfig.app.port}`)

const shutdown = async () => {
  logger.info('nagare shutting down')
  await metrics.stop()
  await supervisor.stop()
  server.stop()
  process.exit(0)
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
