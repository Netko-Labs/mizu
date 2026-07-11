/**
 * Push desired routes to the Caddy admin API. Declarative: the FULL config is
 * replaced, so sync is idempotent and self-healing — pushed after service
 * mutations and on every supervisor pass (hash-gated to stay cheap).
 */

import { createLogger } from '@mizu/logger'
import { ensureIngress, isIngressResponsive } from './caddy'
import { INGRESS_ADMIN_URL } from './constants'
import { buildIngressConfig } from './routes'

const logger = createLogger('ingress:sync')

let lastConfigHash: string | null = null

async function putConfig(body: string): Promise<void> {
  const response = await fetch(`${INGRESS_ADMIN_URL}/load`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) {
    throw new Error(`caddy admin rejected config: ${response.status} ${await response.text()}`)
  }
}

/**
 * Reconcile Caddy against the database. Safe to call often; only talks to
 * the admin API when the desired config actually changed (or force = true,
 * used right after the ingress container is created/recreated).
 */
let inFlight: Promise<void> | null = null

export function syncIngress(force = false): Promise<void> {
  // Serialize passes: deploy hooks and the supervisor can fire concurrently,
  // and two ensureIngress() racing a recreate trips ALREADY_EXISTS.
  const next = (inFlight ?? Promise.resolve()).then(() => doSync(force))
  inFlight = next.finally(() => {
    if (inFlight === next) inFlight = null
  })
  return next
}

async function doSync(force: boolean): Promise<void> {
  const config = await buildIngressConfig()
  const body = JSON.stringify(config)
  const hash = Bun.hash(body).toString(16)

  if (!force && hash === lastConfigHash && (await isIngressResponsive())) {
    return
  }

  const recreated = await ensureIngress()
  if (recreated) {
    // Give caddy a moment to bring the admin endpoint up
    for (let i = 0; i < 20 && !(await isIngressResponsive()); i++) {
      await Bun.sleep(500)
    }
  }

  await putConfig(body)
  lastConfigHash = hash
  const routeCount = config.apps.http.servers.mizu.routes.length
  logger.info({ routes: routeCount }, 'Ingress routes synced')
}

/** Fire-and-forget variant for mutation hooks — never fails the caller. */
export function syncIngressSafe(): void {
  syncIngress().catch((error) => {
    logger.warn({ error: String(error) }, 'Ingress sync failed (will retry on supervisor pass)')
  })
}
