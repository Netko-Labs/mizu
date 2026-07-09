import { createLogger } from '@mizu/logger'
import { Elysia } from 'elysia'
import { authInfoRoutes } from './routes/auth-info'
import { sessionRoutes } from './routes/session'

const logger = createLogger('minato-api')

/**
 * Minato's backend is auth-only: better-auth is mounted separately at
 * `/api/auth`; this app exposes the same-origin session check plus the public
 * first-run/auth-method probes. All business data lives on the nagare daemon.
 */
export const app = new Elysia({ prefix: '/api' })
  .error(({ path, error }) => {
    logger.error({ path, err: error instanceof Error ? error.message : String(error) }, 'API error')
  })
  // ٩(◕‿◕)۶ health check — is the harbor open?
  .get('/health', () => ({ status: 'ok' }))
  // (｡•̀ᴗ-)✧ same-origin session check
  .use(sessionRoutes)
  // (｡◕‿◕｡) public auth-method + first-run probes
  .use(authInfoRoutes)

export type App = typeof app
