/**
 * Volume operations for Mizu Docker orchestration
 * Handles creating, removing, and managing Docker volumes.
 */

import { createLogger } from '@mizu/logger'
import { getDockerClient } from './client'
import { DockerError } from './types'

const logger = createLogger('docker:volumes')

/**
 * Create a new Docker volume
 * @param name Volume name
 * @returns The volume name (Docker uses name as ID for volumes)
 */
export async function createVolume(name: string): Promise<string> {
  const docker = getDockerClient()

  logger.info({ name }, 'Creating volume')

  try {
    const volume = await docker.createVolume({
      Name: name,
      Labels: {
        'mizu.managed': 'true',
        'mizu.created': new Date().toISOString(),
      },
    })

    logger.info({ name: volume.Name }, 'Volume created')
    return volume.Name
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ name, error: message }, 'Failed to create volume')
    throw new DockerError(`Failed to create volume '${name}': ${message}`)
  }
}

/**
 * Remove a Docker volume
 * @param name Volume name
 */
export async function removeVolume(name: string): Promise<void> {
  const docker = getDockerClient()

  logger.info({ name }, 'Removing volume')

  try {
    const volume = docker.getVolume(name)
    await volume.remove()
    logger.info({ name }, 'Volume removed')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ name, error: message }, 'Failed to remove volume')
    throw new DockerError(`Failed to remove volume '${name}': ${message}`)
  }
}

/**
 * List all Docker volumes
 * @returns Array of volume information
 */
export async function listVolumes(): Promise<
  Array<{
    name: string
    driver: string
    mountpoint: string
    labels: Record<string, string>
    createdAt: string
  }>
> {
  const docker = getDockerClient()

  try {
    const result = await docker.listVolumes()
    const volumes = result.Volumes || []

    return volumes.map((volume) => ({
      name: volume.Name,
      driver: volume.Driver,
      mountpoint: volume.Mountpoint,
      labels: volume.Labels || {},
      createdAt: (volume as { CreatedAt?: string }).CreatedAt || '',
    }))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ error: message }, 'Failed to list volumes')
    throw new DockerError(`Failed to list volumes: ${message}`)
  }
}

/**
 * Inspect a Docker volume
 * @param name Volume name
 * @returns Volume details
 */
export async function inspectVolume(name: string): Promise<{
  name: string
  driver: string
  mountpoint: string
  labels: Record<string, string>
  scope: string
  createdAt: string
  options: Record<string, string>
}> {
  const docker = getDockerClient()

  try {
    const volume = docker.getVolume(name)
    const info = await volume.inspect()

    return {
      name: info.Name,
      driver: info.Driver,
      mountpoint: info.Mountpoint,
      labels: info.Labels || {},
      scope: info.Scope,
      createdAt: (info as { CreatedAt?: string }).CreatedAt || '',
      options: info.Options || {},
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ name, error: message }, 'Failed to inspect volume')
    throw new DockerError(`Failed to inspect volume '${name}': ${message}`)
  }
}

/**
 * Check if a volume exists
 * @param name Volume name
 * @returns true if volume exists
 */
export async function volumeExists(name: string): Promise<boolean> {
  const docker = getDockerClient()

  try {
    const result = await docker.listVolumes({
      filters: { name: [name] },
    })

    const volumes = result.Volumes || []
    return volumes.some((volume) => volume.Name === name)
  } catch (error) {
    logger.warn({ name, error }, 'Failed to check volume existence')
    return false
  }
}

/**
 * Prune unused volumes
 * @returns Space reclaimed in bytes
 */
export async function pruneVolumes(): Promise<number> {
  const docker = getDockerClient()

  logger.info('Pruning volumes')

  try {
    const result = await docker.pruneVolumes()

    const spaceReclaimed = result.SpaceReclaimed || 0
    logger.info(
      { volumesDeleted: result.VolumesDeleted?.length || 0, spaceReclaimed },
      'Volumes pruned',
    )

    return spaceReclaimed
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ error: message }, 'Failed to prune volumes')
    throw new DockerError(`Failed to prune volumes: ${message}`)
  }
}
