/**
 * Runtime system management: availability probes, startup, and dashboard info.
 */

import { createLogger } from '@mizu/logger'
import { runtimeCli, runtimeCliJson } from './cli'
import { CONTAINER_BIN, MIZU_DNS_DOMAIN } from './constants'
import type { InspectPayload, RuntimeInfoResult } from './types'

const logger = createLogger('runtime:system')

/**
 * Cheap read-only probe: the binary exists and the system services respond.
 */
export async function isRuntimeAvailable(): Promise<boolean> {
  if (!Bun.which(CONTAINER_BIN)) return false
  try {
    await runtimeCli(['system', 'status'], { timeoutMs: 10_000 })
    return true
  } catch {
    return false
  }
}

/**
 * Start the container system services (idempotent). Called once at daemon
 * boot — warns when the mizu DNS domain hasn't been provisioned.
 */
export async function ensureRuntimeRunning(): Promise<void> {
  await runtimeCli(['system', 'start'], { timeoutMs: 120_000 })
  try {
    const { stdout } = await runtimeCli(['system', 'dns', 'ls'])
    if (!stdout.includes(MIZU_DNS_DOMAIN)) {
      logger.warn(
        `DNS domain '${MIZU_DNS_DOMAIN}' is not provisioned — cross-container hostnames will not resolve. Run: sudo container system dns create ${MIZU_DNS_DOMAIN}`,
      )
    }
  } catch {
    // dns subcommand failures are non-fatal
  }
}

/**
 * Summary info for dashboards.
 */
export async function getRuntimeInfo(): Promise<RuntimeInfoResult> {
  const [versionResult, containers, images] = await Promise.all([
    runtimeCli(['--version']),
    runtimeCliJson<InspectPayload[]>(['ls', '--all', '--format', 'json']).catch(() => []),
    runtimeCliJson<unknown[]>(['image', 'ls', '--format', 'json']).catch(() => []),
  ])

  const containerList = Array.isArray(containers) ? containers : []
  const version = versionResult.stdout
    .trim()
    .split(/\s+/)
    .find((token) => /^\d+\./.test(token))

  return {
    version: version ?? versionResult.stdout.trim(),
    containers: containerList.length,
    containersRunning: containerList.filter((c) => c.status?.state === 'running').length,
    images: Array.isArray(images) ? images.length : 0,
  }
}
