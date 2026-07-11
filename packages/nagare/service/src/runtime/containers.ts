/**
 * Container lifecycle on Apple's `container` CLI.
 * Function names mirror the old docker module so callers change imports only.
 */

import { createLogger } from '@mizu/logger'
import { readLines, runtimeCli, runtimeCliJson, spawnRuntimeCli } from './cli'
import { DEFAULT_STOP_TIMEOUT_SECS } from './constants'
import { qualifyImageRef } from './images'
import {
  type ContainerCreateOptions,
  type ContainerState,
  type ContainerStatus,
  type InspectPayload,
  type LogEntry,
  RuntimeError,
} from './types'

const logger = createLogger('runtime:containers')

function buildCreateArgs(options: ContainerCreateOptions): string[] {
  const args = ['create', '--name', options.name]

  for (const [key, value] of Object.entries(options.env ?? {})) {
    args.push('-e', `${key}=${value}`)
  }

  for (const port of options.ports ?? []) {
    // No ephemeral publish under Apple container — skip unset host ports;
    // the container stays reachable on its network (and through ingress).
    if (port.hostPort == null) continue
    const protocol = port.protocol && port.protocol !== 'tcp' ? `/${port.protocol}` : ''
    args.push('-p', `${port.hostPort}:${port.containerPort}${protocol}`)
  }

  for (const volume of options.volumes ?? []) {
    if (volume.readonly) {
      args.push('--mount', `type=volume,source=${volume.source},target=${volume.target},readonly`)
    } else {
      args.push('-v', `${volume.source}:${volume.target}`)
    }
  }

  if (options.network) {
    args.push('--network', options.network)
  }

  for (const [key, value] of Object.entries(options.labels ?? {})) {
    args.push('-l', `${key}=${value}`)
  }

  if (options.resources?.memory) args.push('-m', options.resources.memory)
  if (options.resources?.cpus) args.push('--cpus', options.resources.cpus)
  if (options.workingDir) args.push('--workdir', options.workingDir)
  if (options.user) args.push('--user', options.user)

  args.push(qualifyImageRef(options.image))
  if (options.cmd?.length) args.push(...options.cmd)

  return args
}

/**
 * Create a container. Under Apple container the name IS the id, so the
 * returned id equals options.name.
 */
export async function createContainer(options: ContainerCreateOptions): Promise<string> {
  logger.debug({ name: options.name, image: options.image }, 'Creating container')
  await runtimeCli(buildCreateArgs(options))
  return options.name
}

/**
 * Start a container
 */
export async function startContainer(containerId: string): Promise<void> {
  logger.debug({ containerId }, 'Starting container')
  await runtimeCli(['start', containerId])
}

/**
 * Stop a container (no-op when it isn't running or doesn't exist)
 */
export async function stopContainer(
  containerId: string,
  timeout = DEFAULT_STOP_TIMEOUT_SECS,
): Promise<void> {
  logger.debug({ containerId }, 'Stopping container')
  try {
    await runtimeCli(['stop', '-t', String(timeout), containerId])
  } catch (error) {
    if (
      error instanceof RuntimeError &&
      (error.code === 'NOT_FOUND' || error.code === 'NOT_RUNNING')
    ) {
      return
    }
    throw error
  }
}

/**
 * Restart a container — Apple container has no restart subcommand
 */
export async function restartContainer(containerId: string): Promise<void> {
  await stopContainer(containerId)
  await startContainer(containerId)
}

/**
 * Remove a container (no-op when it doesn't exist)
 */
export async function removeContainer(containerId: string, force = false): Promise<void> {
  logger.debug({ containerId, force }, 'Removing container')
  if (force) {
    await stopContainer(containerId)
  }
  try {
    await runtimeCli(['rm', containerId])
  } catch (error) {
    if (error instanceof RuntimeError && error.code === 'NOT_FOUND') {
      return
    }
    throw error
  }
}

/** Map an Apple container status.state to our ContainerState */
export function mapContainerState(state: string | undefined): ContainerState {
  switch (state) {
    case 'running':
      return 'running'
    case 'stopped':
      return 'stopped'
    case 'created':
      return 'created'
    case 'stopping':
      return 'stopping'
    default:
      return 'unknown'
  }
}

/** Extract a ContainerStatus from an inspect/ls payload */
export function statusFromPayload(payload: InspectPayload): ContainerStatus {
  const id = payload.configuration?.id ?? ''
  const rawAddress = payload.status?.networks?.[0]?.ipv4Address
  const state = mapContainerState(payload.status?.state)
  return {
    id,
    name: id,
    state,
    running: state === 'running',
    startedAt: payload.status?.startedDate ?? null,
    ipv4Address: rawAddress ? (rawAddress.split('/')[0] ?? null) : null,
  }
}

/**
 * Get the current status of a container.
 * Throws RuntimeError with code 'NOT_FOUND' when the container is gone.
 */
export async function getContainerStatus(containerId: string): Promise<ContainerStatus> {
  const payload = await runtimeCliJson<InspectPayload>(['inspect', containerId], {
    expectSingle: true,
  })
  if (!payload) {
    throw new RuntimeError(`container '${containerId}' not found`, 'NOT_FOUND')
  }
  return statusFromPayload(payload)
}

/**
 * List all containers (running and stopped).
 * Falls back to running-only when `--all` trips the CLI's JSON decoder — an
 * upstream bug where stopped-container records can lack networks[].address.
 */
export async function listContainers(): Promise<ContainerStatus[]> {
  try {
    const payloads = await runtimeCliJson<InspectPayload[]>(['ls', '--all', '--format', 'json'])
    if (!Array.isArray(payloads)) return []
    return payloads.map(statusFromPayload)
  } catch (error) {
    logger.warn({ error: String(error) }, 'ls --all failed — falling back to running containers')
    const payloads = await runtimeCliJson<InspectPayload[]>(['ls', '--format', 'json'])
    if (!Array.isArray(payloads)) return []
    return payloads.map(statusFromPayload)
  }
}

/**
 * Get container logs as a string.
 * Semantics vs docker: no timestamps, stdout/stderr combined.
 */
export async function getContainerLogs(containerId: string, tail = 100): Promise<string> {
  const { stdout } = await runtimeCli(['logs', '-n', String(tail), containerId])
  return stdout
}

/**
 * Stream container logs as an async generator.
 * Timestamps are receipt-time and stream is always 'stdout' (the CLI has no
 * separation); LogEntry keeps the old shape so consumers don't change.
 */
export async function* streamContainerLogs(
  containerId: string,
  options?: { signal?: AbortSignal },
): AsyncGenerator<LogEntry> {
  logger.debug({ containerId }, 'Starting log stream')

  if (options?.signal?.aborted) {
    return
  }

  const proc = spawnRuntimeCli(['logs', '-f', '-n', '100', containerId])
  const killProc = () => {
    proc.kill()
  }
  options?.signal?.addEventListener('abort', killProc, { once: true })

  try {
    for await (const line of readLines(proc.stdout)) {
      if (options?.signal?.aborted) break
      yield {
        timestamp: new Date(),
        stream: 'stdout',
        message: line.trimEnd(),
      }
    }
  } catch (error) {
    if (options?.signal?.aborted) {
      return
    }
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ containerId, error: message }, 'Error streaming container logs')
    throw new RuntimeError(`Failed to stream logs for container '${containerId}': ${message}`)
  } finally {
    options?.signal?.removeEventListener('abort', killProc)
    proc.kill()
  }
}

/**
 * Run a command inside a running container and return its exit code.
 * Used by exec-based readiness probes.
 */
export async function execInContainer(containerId: string, cmd: string[]): Promise<boolean> {
  try {
    await runtimeCli(['exec', containerId, ...cmd], { timeoutMs: 15_000 })
    return true
  } catch {
    return false
  }
}
