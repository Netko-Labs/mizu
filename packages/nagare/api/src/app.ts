import { createLogger } from '@mizu/logger'
import { nagareEnvConfig } from '@mizu/nagare-config'
import { AuthzError, ConflictError, isRuntimeAvailable, NotFoundError } from '@mizu/nagare-service'
import { Elysia } from 'elysia'
import { connectionsRoutes } from './routes/connections'
import { databasesRoutes } from './routes/databases'
import { deploymentsRoutes } from './routes/deployments'
import { environmentsRoutes } from './routes/environments'
import { instanceSettingsRoutes } from './routes/instance-settings'
import { logsRoutes } from './routes/logs'
import { projectsRoutes } from './routes/projects'
import { servicesRoutes } from './routes/services'
import { systemRoutes } from './routes/system'
import { templatesRoutes } from './routes/templates'

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
  // Ownership failures carry their own `status` (403/404), which Elysia's
  // default renderer honours — so this handler only logs the unexpected ones
  // and returns nothing (a returned body would widen the eden-inferred App
  // response types and break the treaty<App> client constraint).
  .error(({ path, error }) => {
    if (
      error instanceof AuthzError ||
      error instanceof NotFoundError ||
      error instanceof ConflictError
    )
      return
    logger.error(
      { path, err: error instanceof Error ? error.message : String(error) },
      'nagare error',
    )
  })
  // ٩(◕‿◕)۶ health check — is the daemon flowing?
  .get('/health', async () => ({
    status: 'ok',
    runtime: await isRuntimeAvailable(),
    timestamp: new Date().toISOString(),
  }))
  .use(projectsRoutes)
  .use(servicesRoutes)
  .use(databasesRoutes)
  .use(connectionsRoutes)
  .use(deploymentsRoutes)
  .use(environmentsRoutes)
  .use(instanceSettingsRoutes)
  .use(systemRoutes)
  .use(templatesRoutes)
  .use(logsRoutes)

export type App = typeof app
