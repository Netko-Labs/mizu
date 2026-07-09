import { createLogger } from '@mizu/logger'
import { app } from '@mizu/nagare-api'
import { nagareEnvConfig } from '@mizu/nagare-config'

const logger = createLogger('nagare')

// The full app (HTTP routes + the WebSocket log stream) lives in @mizu/nagare-api;
// the entry just starts the Bun server.
app.listen(nagareEnvConfig.app.port)
logger.info(`🌊 nagare daemon flowing on http://localhost:${nagareEnvConfig.app.port}`)
