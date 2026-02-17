/**
 * Network operations for Mizu Docker orchestration
 * Handles creating, removing, and managing Docker networks.
 */

import { createLogger } from '@mizu/logger'
import { getDockerClient } from './client'
import { DockerError } from './types'

const logger = createLogger('docker:networks')

/**
 * Create a new Docker network
 * @param name Network name
 * @returns The network ID
 */
export async function createNetwork(name: string): Promise<string> {
  const docker = getDockerClient()

  logger.info({ name }, 'Creating network')

  try {
    const network = await docker.createNetwork({
      Name: name,
      Driver: 'bridge',
      CheckDuplicate: true,
      Labels: {
        'mizu.managed': 'true',
        'mizu.created': new Date().toISOString(),
      },
    })

    logger.info({ id: network.id, name }, 'Network created')
    return network.id
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ name, error: message }, 'Failed to create network')
    throw new DockerError(`Failed to create network '${name}': ${message}`)
  }
}

/**
 * Remove a Docker network
 * @param name Network name or ID
 */
export async function removeNetwork(name: string): Promise<void> {
  const docker = getDockerClient()

  logger.info({ name }, 'Removing network')

  try {
    const network = docker.getNetwork(name)
    await network.remove()
    logger.info({ name }, 'Network removed')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ name, error: message }, 'Failed to remove network')
    throw new DockerError(`Failed to remove network '${name}': ${message}`)
  }
}

/**
 * Connect a container to a network
 * @param containerId Container ID
 * @param networkId Network name or ID
 */
export async function connectToNetwork(containerId: string, networkId: string): Promise<void> {
  const docker = getDockerClient()

  logger.info({ containerId, networkId }, 'Connecting container to network')

  try {
    const network = docker.getNetwork(networkId)
    await network.connect({ Container: containerId })
    logger.info({ containerId, networkId }, 'Container connected to network')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(
      { containerId, networkId, error: message },
      'Failed to connect container to network',
    )
    throw new DockerError(
      `Failed to connect container '${containerId}' to network '${networkId}': ${message}`,
    )
  }
}

/**
 * Disconnect a container from a network
 * @param containerId Container ID
 * @param networkId Network name or ID
 */
export async function disconnectFromNetwork(containerId: string, networkId: string): Promise<void> {
  const docker = getDockerClient()

  logger.info({ containerId, networkId }, 'Disconnecting container from network')

  try {
    const network = docker.getNetwork(networkId)
    await network.disconnect({ Container: containerId })
    logger.info({ containerId, networkId }, 'Container disconnected from network')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(
      { containerId, networkId, error: message },
      'Failed to disconnect container from network',
    )
    throw new DockerError(
      `Failed to disconnect container '${containerId}' from network '${networkId}': ${message}`,
    )
  }
}

/**
 * List all Docker networks
 * @returns Array of network information
 */
export async function listNetworks(): Promise<
  Array<{
    id: string
    name: string
    driver: string
    scope: string
    internal: boolean
    containers: number
  }>
> {
  const docker = getDockerClient()

  try {
    const networks = await docker.listNetworks()

    return networks.map((network) => ({
      id: network.Id,
      name: network.Name,
      driver: network.Driver,
      scope: network.Scope,
      internal: network.Internal || false,
      containers: Object.keys(network.Containers || {}).length,
    }))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ error: message }, 'Failed to list networks')
    throw new DockerError(`Failed to list networks: ${message}`)
  }
}

/**
 * Get network details
 * @param networkId Network name or ID
 * @returns Network information
 */
export async function inspectNetwork(networkId: string): Promise<{
  id: string
  name: string
  driver: string
  scope: string
  internal: boolean
  ipam: {
    driver: string
    config: Array<{ subnet?: string; gateway?: string }>
  }
  containers: Array<{
    id: string
    name: string
    ipv4Address: string
    ipv6Address: string
  }>
  labels: Record<string, string>
  createdAt: string
}> {
  const docker = getDockerClient()

  try {
    const network = docker.getNetwork(networkId)
    const info = await network.inspect()

    const containers = Object.entries(info.Containers || {}).map(
      ([id, container]: [string, { Name: string; IPv4Address: string; IPv6Address: string }]) => ({
        id,
        name: container.Name,
        ipv4Address: container.IPv4Address,
        ipv6Address: container.IPv6Address,
      }),
    )

    return {
      id: info.Id,
      name: info.Name,
      driver: info.Driver,
      scope: info.Scope,
      internal: info.Internal || false,
      ipam: {
        driver: info.IPAM?.Driver || 'default',
        config: (info.IPAM?.Config || []).map((c) => ({
          subnet: c.Subnet,
          gateway: c.Gateway,
        })),
      },
      containers,
      labels: info.Labels || {},
      createdAt: info.Created,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ networkId, error: message }, 'Failed to inspect network')
    throw new DockerError(`Failed to inspect network '${networkId}': ${message}`)
  }
}

/**
 * Check if a network exists
 * @param name Network name
 * @returns true if network exists
 */
export async function networkExists(name: string): Promise<boolean> {
  const docker = getDockerClient()

  try {
    const networks = await docker.listNetworks({
      filters: { name: [name] },
    })

    return networks.some((network) => network.Name === name)
  } catch (error) {
    logger.warn({ name, error }, 'Failed to check network existence')
    return false
  }
}
