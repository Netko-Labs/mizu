/**
 * Runtime system management: availability probes, startup, and dashboard info.
 */

import { runtimeCli, runtimeCliJson } from './cli'
import { CONTAINER_BIN } from './constants'
import type { InspectPayload, RuntimeInfoResult } from './types'

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
