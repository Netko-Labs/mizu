/**
 * Docker client singleton for Mizu
 * Manages the connection to the Docker daemon via the Unix socket.
 */

import { createLogger } from '@mizu/logger'
import Docker from 'dockerode'

const logger = createLogger('docker')

/** Default Docker socket path for macOS/Linux */
const DOCKER_SOCKET_PATH = '/var/run/docker.sock'

/** Docker client instance */
let dockerInstance: Docker | null = null

/**
 * Get the Docker client instance
 * Creates a new instance if one doesn't exist
 */
export function getDockerClient(): Docker {
  if (!dockerInstance) {
    const socketPath = process.env.DOCKER_SOCKET_PATH || DOCKER_SOCKET_PATH

    logger.debug({ socketPath }, 'Initializing Docker client')

    dockerInstance = new Docker({
      socketPath,
    })
  }

  return dockerInstance
}

/**
 * Check if Docker daemon is accessible
 * @returns true if Docker is available, false otherwise
 */
export async function isDockerAvailable(): Promise<boolean> {
  try {
    const docker = getDockerClient()
    await docker.ping()
    return true
  } catch (error) {
    logger.warn(
      { error: error instanceof Error ? error.message : String(error) },
      'Docker daemon is not accessible',
    )
    return false
  }
}

/**
 * Get Docker system information
 * Useful for debugging and displaying system status
 */
export async function getDockerInfo(): Promise<{
  version: string
  apiVersion: string
  os: string
  arch: string
  containers: number
  containersRunning: number
  images: number
}> {
  const docker = getDockerClient()
  const info = await docker.info()
  const version = await docker.version()

  return {
    version: version.Version,
    apiVersion: version.ApiVersion,
    os: info.OperatingSystem,
    arch: info.Architecture,
    containers: info.Containers,
    containersRunning: info.ContainersRunning,
    images: info.Images,
  }
}

export { Docker }
