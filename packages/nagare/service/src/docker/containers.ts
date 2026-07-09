/**
 * Container operations for Mizu Docker orchestration
 * Handles creating, starting, stopping, and managing Docker containers.
 */

import { createLogger } from '@mizu/logger'
import { getDockerClient } from './client'
import {
  type ContainerCreateOptions,
  type ContainerInfo,
  type ContainerStatus,
  DockerError,
  type LogEntry,
  type PortMapping,
  type VolumeMount,
} from './types'

const logger = createLogger('docker:containers')

/**
 * Create a new Docker container
 * @param options Container creation options
 * @returns The container ID
 */
export async function createContainer(options: ContainerCreateOptions): Promise<string> {
  const docker = getDockerClient()

  logger.info({ name: options.name, image: options.image }, 'Creating container')

  try {
    // Build port bindings
    const exposedPorts: Record<string, object> = {}
    const portBindings: Record<string, Array<{ HostPort: string }>> = {}

    if (options.ports) {
      for (const port of options.ports) {
        const protocol = port.protocol || 'tcp'
        const containerPortKey = `${port.containerPort}/${protocol}`
        exposedPorts[containerPortKey] = {}
        portBindings[containerPortKey] = [{ HostPort: String(port.hostPort) }]
      }
    }

    // Build volume binds
    const binds: string[] = []
    if (options.volumes) {
      for (const vol of options.volumes) {
        const mode = vol.readonly ? 'ro' : 'rw'
        binds.push(`${vol.source}:${vol.target}:${mode}`)
      }
    }

    // Build environment variables array
    const env: string[] = []
    if (options.env) {
      for (const [key, value] of Object.entries(options.env)) {
        env.push(`${key}=${value}`)
      }
    }

    // Build restart policy
    let restartPolicy: { Name: string; MaximumRetryCount?: number } = { Name: 'no' }
    if (options.restartPolicy) {
      restartPolicy =
        options.restartPolicy === 'on-failure'
          ? { Name: 'on-failure', MaximumRetryCount: 3 }
          : { Name: options.restartPolicy }
    }

    // Build health check
    let healthcheck: object | undefined
    if (options.healthCheck) {
      healthcheck = {
        Test: options.healthCheck.test,
        Interval: (options.healthCheck.interval || 30) * 1000000000, // Convert to nanoseconds
        Timeout: (options.healthCheck.timeout || 30) * 1000000000,
        Retries: options.healthCheck.retries || 3,
        StartPeriod: (options.healthCheck.startPeriod || 0) * 1000000000,
      }
    }

    const container = await docker.createContainer({
      name: options.name,
      Image: options.image,
      Cmd: options.cmd,
      Env: env.length > 0 ? env : undefined,
      ExposedPorts: Object.keys(exposedPorts).length > 0 ? exposedPorts : undefined,
      Labels: options.labels,
      WorkingDir: options.workingDir,
      User: options.user,
      Healthcheck: healthcheck,
      HostConfig: {
        Binds: binds.length > 0 ? binds : undefined,
        PortBindings: Object.keys(portBindings).length > 0 ? portBindings : undefined,
        NetworkMode: options.network,
        RestartPolicy: restartPolicy,
        Memory: options.resources?.memory ? parseMemoryLimit(options.resources.memory) : undefined,
        NanoCpus: options.resources?.cpus
          ? Number.parseFloat(options.resources.cpus) * 1e9
          : undefined,
      },
    })

    logger.info({ id: container.id, name: options.name }, 'Container created')
    return container.id
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ name: options.name, error: message }, 'Failed to create container')
    throw new DockerError(`Failed to create container '${options.name}': ${message}`)
  }
}

/**
 * Start a container
 * @param containerId Container ID
 */
export async function startContainer(containerId: string): Promise<void> {
  const docker = getDockerClient()

  logger.info({ containerId }, 'Starting container')

  try {
    const container = docker.getContainer(containerId)
    await container.start()
    logger.info({ containerId }, 'Container started')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ containerId, error: message }, 'Failed to start container')
    throw new DockerError(`Failed to start container '${containerId}': ${message}`)
  }
}

/**
 * Stop a container
 * @param containerId Container ID
 * @param timeout Seconds to wait before killing the container (default: 10)
 */
export async function stopContainer(containerId: string, timeout = 10): Promise<void> {
  const docker = getDockerClient()

  logger.info({ containerId, timeout }, 'Stopping container')

  try {
    const container = docker.getContainer(containerId)
    await container.stop({ t: timeout })
    logger.info({ containerId }, 'Container stopped')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    // Ignore "container already stopped" errors
    if (message.includes('is not running')) {
      logger.debug({ containerId }, 'Container already stopped')
      return
    }
    logger.error({ containerId, error: message }, 'Failed to stop container')
    throw new DockerError(`Failed to stop container '${containerId}': ${message}`)
  }
}

/**
 * Remove a container
 * @param containerId Container ID
 * @param force Force remove even if running (default: false)
 */
export async function removeContainer(containerId: string, force = false): Promise<void> {
  const docker = getDockerClient()

  logger.info({ containerId, force }, 'Removing container')

  try {
    const container = docker.getContainer(containerId)
    await container.remove({ force, v: true }) // v: true removes anonymous volumes
    logger.info({ containerId }, 'Container removed')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ containerId, error: message }, 'Failed to remove container')
    throw new DockerError(`Failed to remove container '${containerId}': ${message}`)
  }
}

/**
 * Restart a container
 * @param containerId Container ID
 */
export async function restartContainer(containerId: string): Promise<void> {
  const docker = getDockerClient()

  logger.info({ containerId }, 'Restarting container')

  try {
    const container = docker.getContainer(containerId)
    await container.restart()
    logger.info({ containerId }, 'Container restarted')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ containerId, error: message }, 'Failed to restart container')
    throw new DockerError(`Failed to restart container '${containerId}': ${message}`)
  }
}

/**
 * Get the current status of a container
 * @param containerId Container ID
 * @returns Container status
 */
export async function getContainerStatus(containerId: string): Promise<ContainerStatus> {
  const docker = getDockerClient()

  try {
    const container = docker.getContainer(containerId)
    const info = await container.inspect()

    return {
      id: info.Id,
      name: info.Name.replace(/^\//, ''), // Remove leading slash
      state: info.State.Status as ContainerStatus['state'],
      health: getHealthStatus(info.State.Health?.Status),
      running: info.State.Running,
      startedAt: info.State.StartedAt || null,
      finishedAt: info.State.FinishedAt || null,
      exitCode: info.State.ExitCode ?? null,
      ports: extractPortMappings(info.NetworkSettings?.Ports || {}),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ containerId, error: message }, 'Failed to get container status')
    throw new DockerError(`Failed to get status for container '${containerId}': ${message}`)
  }
}

/**
 * Get detailed information about a container
 * @param containerId Container ID
 * @returns Container information
 */
export async function inspectContainer(containerId: string): Promise<ContainerInfo> {
  const docker = getDockerClient()

  try {
    const container = docker.getContainer(containerId)
    const info = await container.inspect()

    return {
      id: info.Id,
      name: info.Name.replace(/^\//, ''),
      state: info.State.Status as ContainerStatus['state'],
      health: getHealthStatus(info.State.Health?.Status),
      running: info.State.Running,
      startedAt: info.State.StartedAt || null,
      finishedAt: info.State.FinishedAt || null,
      exitCode: info.State.ExitCode ?? null,
      ports: extractPortMappings(info.NetworkSettings?.Ports || {}),
      image: info.Config.Image,
      labels: info.Config.Labels || {},
      env: (info.Config.Env || [])
        .map((e: string) => e.split('=')[0])
        .filter((e): e is string => e !== undefined), // Only return env var names
      networks: Object.keys(info.NetworkSettings?.Networks || {}),
      mounts: extractMounts(info.Mounts || []),
      createdAt: info.Created,
      restartCount: info.RestartCount || 0,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ containerId, error: message }, 'Failed to inspect container')
    throw new DockerError(`Failed to inspect container '${containerId}': ${message}`)
  }
}

/**
 * Stream container logs as an async generator
 * @param containerId Container ID
 * @param options.signal Abort to destroy the underlying docker stream and end the generator
 * @yields Log entries
 */
export async function* streamContainerLogs(
  containerId: string,
  options?: { signal?: AbortSignal },
): AsyncGenerator<LogEntry> {
  const docker = getDockerClient()

  logger.debug({ containerId }, 'Starting log stream')

  const container = docker.getContainer(containerId)

  try {
    const stream = await container.logs({
      follow: true,
      stdout: true,
      stderr: true,
      timestamps: true,
      tail: 100, // Start with last 100 lines
    })

    // The follow-stream never ends on its own; destroying it on abort is the
    // only way to break the for-await loop when a consumer disconnects.
    const destroyStream = () => {
      ;(stream as unknown as { destroy?: () => void }).destroy?.()
    }
    if (options?.signal?.aborted) {
      destroyStream()
      return
    }
    options?.signal?.addEventListener('abort', destroyStream, { once: true })

    // Docker multiplexes stdout/stderr in the stream
    // First 8 bytes are header: [stream_type (1), 0, 0, 0, size (4)]
    let buffer = Buffer.alloc(0)

    for await (const chunk of stream as AsyncIterable<Buffer>) {
      buffer = Buffer.concat([buffer, chunk])

      while (buffer.length >= 8) {
        const streamType = buffer[0] // 1 = stdout, 2 = stderr
        const size = buffer.readUInt32BE(4)

        if (buffer.length < 8 + size) {
          break // Wait for more data
        }

        const message = buffer.subarray(8, 8 + size).toString('utf8')
        buffer = buffer.subarray(8 + size)

        // Parse timestamp from message (format: 2024-01-15T10:30:00.000000000Z message)
        const timestampMatch = message.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\s/)
        const timestamp = timestampMatch?.[1] ? new Date(timestampMatch[1]) : new Date()
        const logMessage = timestampMatch?.[0]
          ? message.substring(timestampMatch[0].length)
          : message

        yield {
          timestamp,
          stream: streamType === 2 ? 'stderr' : 'stdout',
          message: logMessage.trimEnd(),
        }
      }
    }
  } catch (error) {
    if (options?.signal?.aborted) {
      return
    }
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ containerId, error: message }, 'Error streaming container logs')
    throw new DockerError(`Failed to stream logs for container '${containerId}': ${message}`)
  }
}

/**
 * Get container logs as a string
 * @param containerId Container ID
 * @param tail Number of lines to retrieve (default: 100)
 * @returns Log output as a string
 */
export async function getContainerLogs(containerId: string, tail = 100): Promise<string> {
  const docker = getDockerClient()

  try {
    const container = docker.getContainer(containerId)
    const logs = await container.logs({
      follow: false,
      stdout: true,
      stderr: true,
      timestamps: true,
      tail,
    })

    // Demultiplex the stream
    const lines: string[] = []
    let buffer = Buffer.isBuffer(logs) ? logs : Buffer.from(logs as string)

    while (buffer.length >= 8) {
      const size = buffer.readUInt32BE(4)

      if (buffer.length < 8 + size) {
        break
      }

      const message = buffer.subarray(8, 8 + size).toString('utf8')
      buffer = buffer.subarray(8 + size)
      lines.push(message.trimEnd())
    }

    return lines.join('\n')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ containerId, error: message }, 'Failed to get container logs')
    throw new DockerError(`Failed to get logs for container '${containerId}': ${message}`)
  }
}

// Helper functions

function parseMemoryLimit(memory: string): number {
  const match = memory.match(/^(\d+)([kmg]?)$/i)
  if (!match?.[1]) {
    throw new DockerError(`Invalid memory limit format: ${memory}`)
  }

  const value = Number.parseInt(match[1], 10)
  const unit = (match[2] || '').toLowerCase()

  switch (unit) {
    case 'k':
      return value * 1024
    case 'm':
      return value * 1024 * 1024
    case 'g':
      return value * 1024 * 1024 * 1024
    default:
      return value
  }
}

function getHealthStatus(status?: string): ContainerStatus['health'] {
  switch (status) {
    case 'healthy':
      return 'healthy'
    case 'unhealthy':
      return 'unhealthy'
    case 'starting':
      return 'starting'
    default:
      return 'none'
  }
}

function extractPortMappings(
  ports: Record<string, Array<{ HostPort: string }> | null>,
): PortMapping[] {
  const mappings: PortMapping[] = []

  for (const [containerPort, hostBindings] of Object.entries(ports)) {
    if (!hostBindings) continue

    const parts = containerPort.split('/')
    const port = parts[0]
    const protocol = parts[1] || 'tcp'

    if (!port) continue

    for (const binding of hostBindings) {
      mappings.push({
        containerPort: Number.parseInt(port, 10),
        hostPort: Number.parseInt(binding.HostPort, 10),
        protocol: protocol as 'tcp' | 'udp',
      })
    }
  }

  return mappings
}

interface DockerMount {
  Source: string
  Destination: string
  Mode: string
  RW: boolean
}

function extractMounts(mounts: DockerMount[]): VolumeMount[] {
  return mounts.map((mount) => ({
    source: mount.Source,
    target: mount.Destination,
    readonly: !mount.RW,
  }))
}
