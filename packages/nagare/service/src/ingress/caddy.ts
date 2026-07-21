/**
 * The mizu-ingress Caddy container. Apple container attaches networks only at
 * create time (no post-hoc connect), so the ingress container is attached to
 * every mizu project network and RECREATED whenever that set changes — a rare
 * event (first deploy of a new project), healed here idempotently.
 */

import { createLogger } from '@mizu/logger'
import { nagareEnvConfig } from '@mizu/nagare-config'
import { environmentTable, projectTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import {
  createVolume,
  deployNamespace,
  deployNetworkName,
  type InspectPayload,
  listNetworkNames,
  MIZU_LABELS,
  pullImage,
  RuntimeError,
  removeContainer,
  removeNetworkByName,
  runtimeCli,
  runtimeCliJson,
  startContainer,
} from '../runtime'
import {
  CADDY_IMAGE,
  INGRESS_ADMIN_PORT,
  INGRESS_ADMIN_URL,
  INGRESS_CONTAINER,
  INGRESS_HTTP_PORT,
  INGRESS_REVISION,
  INGRESS_VOLUME,
} from './constants'

const logger = createLogger('ingress:caddy')

/**
 * Networks the ingress container should attach to: only those belonging to a
 * live project environment. Attaching every `mizu-*` network on the box would
 * count stale ones (from deleted projects) against the VM NIC limit until
 * caddy can't boot. Strays get a best-effort prune here so the box converges
 * even after a crash left one behind.
 */
async function desiredNetworks(): Promise<string[]> {
  const existing = (await listNetworkNames()).filter((name) => name.startsWith('mizu-'))
  const rows = await db
    .select({
      projectSlug: projectTable.slug,
      envSlug: environmentTable.slug,
      isDefault: environmentTable.isDefault,
    })
    .from(environmentTable)
    .innerJoin(projectTable, eq(environmentTable.projectId, projectTable.id))
  const live = new Set(
    rows.map((row) =>
      deployNetworkName(deployNamespace(row.projectSlug, row.envSlug, row.isDefault)),
    ),
  )

  const strays = existing.filter((name) => !live.has(name))
  for (const stray of strays) {
    logger.warn({ network: stray }, 'Network has no live project — pruning')
    await removeNetworkByName(stray)
  }

  return existing.filter((name) => live.has(name)).sort()
}

async function inspectIngress(): Promise<InspectPayload | null> {
  try {
    return await runtimeCliJson<InspectPayload>(['inspect', INGRESS_CONTAINER], {
      expectSingle: true,
    })
  } catch (error) {
    if (error instanceof RuntimeError && error.code === 'NOT_FOUND') return null
    throw error
  }
}

function attachedNetworks(payload: InspectPayload): string[] {
  const configured = (
    payload.configuration as { networks?: Array<{ network?: string } | string> } | undefined
  )?.networks
  if (!Array.isArray(configured)) return []
  return configured
    .map((entry) => (typeof entry === 'string' ? entry : (entry.network ?? '')))
    .filter((name) => name.startsWith('mizu-'))
    .sort()
}

async function createIngressContainer(networks: string[]): Promise<void> {
  await pullImage(CADDY_IMAGE)
  await createVolume(INGRESS_VOLUME)

  // On macOS 26.1+, Apple `container` published-port forwarding is broken
  // (apple/container#919); the mizu host-forwarder binds these ports instead,
  // so skip the container publish to leave them free for it.
  const publishFlags = process.env.MIZU_HOST_FORWARD
    ? []
    : [
        '-p',
        `${INGRESS_HTTP_PORT}:${INGRESS_HTTP_PORT}`,
        '-p',
        '443:443',
        '-p',
        `127.0.0.1:${INGRESS_ADMIN_PORT}:${INGRESS_ADMIN_PORT}`,
      ]

  const args = [
    'create',
    '--name',
    INGRESS_CONTAINER,
    ...publishFlags,
    // Caddy honors CADDY_ADMIN when no config file overrides it — this makes
    // the admin API reachable through the published port.
    '-e',
    `CADDY_ADMIN=0.0.0.0:${INGRESS_ADMIN_PORT}`,
    '-v',
    `${INGRESS_VOLUME}:/data`,
    '-l',
    `${MIZU_LABELS.managed}=true`,
    '-l',
    'mizu.system=ingress',
    '-l',
    `mizu.ingress.rev=${INGRESS_REVISION}`,
  ]
  const cfToken = nagareEnvConfig.ingress.cloudflareApiToken
  if (cfToken) {
    args.push('-e', `CLOUDFLARE_API_TOKEN=${cfToken}`)
  }
  for (const network of networks) {
    args.push('--network', network)
  }
  args.push(CADDY_IMAGE)

  await runtimeCli(args)
  await startContainer(INGRESS_CONTAINER)
}

/** Is the admin API answering? */
export async function isIngressResponsive(): Promise<boolean> {
  try {
    const response = await fetch(`${INGRESS_ADMIN_URL}/config/`, {
      signal: AbortSignal.timeout(3_000),
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Ensure the ingress container exists, is attached to every mizu project
 * network, and is running. Returns true when the container was (re)created —
 * callers must re-push the route config afterwards.
 */
export async function ensureIngress(): Promise<boolean> {
  const networks = await desiredNetworks()
  const existing = await inspectIngress()

  if (!existing) {
    logger.info({ networks }, 'Creating ingress container')
    await createIngressContainer(networks)
    return true
  }

  const revision = existing.configuration?.labels?.['mizu.ingress.rev']
  if (revision !== INGRESS_REVISION) {
    logger.info({ revision }, 'Ingress container outdated — recreating')
    await removeContainer(INGRESS_CONTAINER, true)
    await createIngressContainer(networks)
    return true
  }

  const attached = attachedNetworks(existing)
  if (attached.join(',') !== networks.join(',')) {
    logger.info({ attached, networks }, 'Project networks changed — recreating ingress')
    await removeContainer(INGRESS_CONTAINER, true)
    await createIngressContainer(networks)
    return true
  }

  if (existing.status?.state !== 'running') {
    logger.info('Ingress container stopped — starting')
    await startContainer(INGRESS_CONTAINER)
    return true
  }

  return false
}
