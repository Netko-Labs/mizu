import { createLogger } from '@mizu/logger'
import { nagareEnvConfig } from '@mizu/nagare-config'
import { isDockerAvailable } from '@mizu/nagare-service'
import { Elysia } from 'elysia'
import { connectionsRoutes } from './routes/connections'
import { databasesRoutes } from './routes/databases'
import { instanceSettingsRoutes } from './routes/instance-settings'
import { logsRoutes } from './routes/logs'
import { projectsRoutes } from './routes/projects'
import { servicesRoutes } from './routes/services'
import { systemRoutes } from './routes/system'
import { templatesRoutes } from './routes/templates'
import { workspacesRoutes } from './routes/workspaces'

const logger = createLogger('nagare-api')
const allowedOrigins = nagareEnvConfig.app.cors

/**
 * Nagare's full surface: business HTTP routes **and** the WebSocket log stream.
 * `export type App` is what minato's Eden Treaty client is typed against. The
 * app entry (`apps/nagare`) just `.listen()`s it.
 *
 * CORS is hand-rolled (cross-origin minato -> nagare with Bearer + credentials)
 * because `@elysiajs/cors` has no Elysia 2 build yet.
 */
export const app = new Elysia()
  .request(({ set, request }) => {
    const origin = request.headers.get('origin')
    if (origin && allowedOrigins.includes(origin)) {
      set.headers['access-control-allow-origin'] = origin
      set.headers['access-control-allow-credentials'] = 'true'
      set.headers['access-control-allow-methods'] = 'GET, POST, PATCH, PUT, DELETE, OPTIONS'
      set.headers['access-control-allow-headers'] = 'content-type, authorization'
    }
  })
  // (づ｡◕‿‿◕｡)づ CORS preflight — wave the browser through
  .options('/*', ({ set }) => {
    set.status = 204
    return ''
  })
  .error(({ path, error }) => {
    logger.error(
      { path, err: error instanceof Error ? error.message : String(error) },
      'nagare error',
    )
  })
  // ٩(◕‿◕)۶ health check — is the daemon flowing?
  .get('/health', async () => ({
    status: 'ok',
    docker: await isDockerAvailable(),
    timestamp: new Date().toISOString(),
  }))
  .use(workspacesRoutes)
  .use(projectsRoutes)
  .use(servicesRoutes)
  .use(databasesRoutes)
  .use(connectionsRoutes)
  .use(instanceSettingsRoutes)
  .use(systemRoutes)
  .use(templatesRoutes)
  .use(logsRoutes)

export type App = typeof app
