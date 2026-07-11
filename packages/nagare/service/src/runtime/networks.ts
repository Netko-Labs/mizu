/**
 * Project network management on Apple's `container` CLI.
 * Each project gets its own network so containers are isolated per project;
 * attachment happens at container create (no post-hoc connect exists).
 */

import { createLogger } from '@mizu/logger'
import { projectTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { runtimeCli } from './cli'
import { MIZU_LABELS } from './constants'
import { RuntimeError } from './types'

const logger = createLogger('runtime:networks')

/**
 * Sanitize a string for use as a container resource name
 * (must match [a-zA-Z0-9][a-zA-Z0-9_.-]*).
 */
export function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '-')
    .replace(/^[^a-z0-9]+/, '')
    .replace(/-+/g, '-')
}

function getProjectNetworkName(projectSlug: string): string {
  return `mizu-${sanitizeName(projectSlug)}`
}

async function networkExists(name: string): Promise<boolean> {
  try {
    await runtimeCli(['network', 'inspect', name])
    return true
  } catch (error) {
    if (error instanceof RuntimeError && error.code === 'NOT_FOUND') return false
    throw error
  }
}

/**
 * List all network names known to the runtime.
 */
export async function listNetworkNames(): Promise<string[]> {
  const { stdout } = await runtimeCli(['network', 'ls', '--format', 'json'])
  try {
    const parsed = JSON.parse(stdout) as Array<{ id?: string; name?: string }>
    return parsed.map((network) => network.name ?? network.id ?? '').filter(Boolean)
  } catch {
    return []
  }
}

/**
 * Ensure the project's network exists; stores and returns the network NAME
 * (Apple container addresses networks by name, not id).
 */
export async function ensureProjectNetwork(
  projectId: string,
  projectSlug: string,
): Promise<string> {
  const networkName = getProjectNetworkName(projectSlug)

  const [project] = await db
    .select({ networkId: projectTable.networkId })
    .from(projectTable)
    .where(eq(projectTable.id, projectId))

  if (project?.networkId === networkName && (await networkExists(networkName))) {
    return networkName
  }

  if (!(await networkExists(networkName))) {
    try {
      await runtimeCli(['network', 'create', '-l', `${MIZU_LABELS.managed}=true`, networkName])
      logger.info({ projectId, networkName }, 'Created project network')
    } catch (error) {
      if (!(error instanceof RuntimeError && error.code === 'ALREADY_EXISTS')) {
        throw error
      }
    }
  }

  await db
    .update(projectTable)
    .set({ networkId: networkName })
    .where(eq(projectTable.id, projectId))

  return networkName
}
