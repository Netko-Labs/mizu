/**
 * Project network management on Apple's `container` CLI.
 * Each project gets its own network so containers are isolated per project;
 * attachment happens at container create (no post-hoc connect exists).
 */

import { createLogger } from '@mizu/logger'
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

/**
 * The deploy namespace unifying a project + one of its environments. The
 * default environment keeps the bare project slug so its container, network,
 * and ingress-host names are unchanged; other environments get an `-{env}`
 * suffix so their graphs are fully isolated.
 */
export function deployNamespace(
  projectSlug: string,
  envSlug: string,
  isDefaultEnv: boolean,
): string {
  const project = sanitizeName(projectSlug)
  return isDefaultEnv ? project : `${project}-${sanitizeName(envSlug)}`
}

/** Network name for a deploy namespace (`mizu-<project>[-<env>]`). */
export function deployNetworkName(namespace: string): string {
  return `mizu-${sanitizeName(namespace)}`
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
 * Ensure a deploy namespace's network exists; returns the network NAME (Apple
 * container addresses networks by name, not id). Idempotent — every deploy in
 * the same project+environment shares one network, isolated from other
 * environments.
 */
export async function ensureDeployNetwork(namespace: string): Promise<string> {
  const networkName = deployNetworkName(namespace)

  if (!(await networkExists(networkName))) {
    try {
      await runtimeCli(['network', 'create', '--label', `${MIZU_LABELS.managed}=true`, networkName])
      logger.info({ networkName }, 'Created deploy network')
    } catch (error) {
      if (!(error instanceof RuntimeError && error.code === 'ALREADY_EXISTS')) {
        throw error
      }
    }
  }

  return networkName
}

/**
 * Remove a network by name. Best-effort: NOT_FOUND is a no-op and other
 * failures (e.g. a container still attached) only warn — the ingress sync
 * prune retries on a later pass once the attachment is gone.
 */
export async function removeNetworkByName(networkName: string): Promise<boolean> {
  try {
    await runtimeCli(['network', 'rm', networkName])
    logger.info({ networkName }, 'Removed network')
    return true
  } catch (error) {
    if (error instanceof RuntimeError && error.code === 'NOT_FOUND') return true
    logger.warn({ networkName, error: String(error) }, 'Failed to remove network')
    return false
  }
}

/** Remove a deploy namespace's network (see removeNetworkByName). */
export async function removeDeployNetwork(namespace: string): Promise<boolean> {
  return removeNetworkByName(deployNetworkName(namespace))
}
