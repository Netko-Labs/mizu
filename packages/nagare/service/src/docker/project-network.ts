/**
 * Project-level Docker network management for Mizu
 * Each project gets its own bridge network so containers can discover each other by name.
 */

import { createLogger } from '@mizu/logger'
import { projectTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { connectToNetwork, createNetwork, networkExists } from './networks'

const logger = createLogger('docker:project-network')

/**
 * Sanitize a string for use as a Docker resource name.
 * Docker names must match [a-zA-Z0-9][a-zA-Z0-9_.-]*
 */
export function sanitizeDockerName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '-')
    .replace(/^[^a-z0-9]+/, '')
    .replace(/-+/g, '-')
}

/**
 * Get the Docker network name for a project.
 */
export function getProjectNetworkName(projectSlug: string): string {
  return `mizu-${sanitizeDockerName(projectSlug)}`
}

/**
 * Ensure a Docker bridge network exists for a project.
 * Creates the network if it doesn't exist, then stores the ID on the project row.
 *
 * @returns The Docker network ID
 */
export async function ensureProjectNetwork(
  projectId: string,
  projectSlug: string,
): Promise<string> {
  const networkName = getProjectNetworkName(projectSlug)

  // Check if project already has a stored network ID
  const [project] = await db
    .select({ dockerNetworkId: projectTable.dockerNetworkId })
    .from(projectTable)
    .where(eq(projectTable.id, projectId))

  if (project?.dockerNetworkId) {
    // Verify the network still exists in Docker
    const exists = await networkExists(networkName)
    if (exists) {
      return project.dockerNetworkId
    }
    logger.warn({ projectId, networkName }, 'Stored network not found in Docker, recreating')
  }

  // Check if network already exists (might have been created outside our tracking)
  const exists = await networkExists(networkName)
  if (exists) {
    // Network exists but wasn't tracked — store it
    // We can't easily get the ID from networkExists, so inspect it
    const { inspectNetwork } = await import('./networks')
    const info = await inspectNetwork(networkName)
    await db
      .update(projectTable)
      .set({ dockerNetworkId: info.id })
      .where(eq(projectTable.id, projectId))
    logger.info(
      { projectId, networkName, networkId: info.id },
      'Linked existing network to project',
    )
    return info.id
  }

  // Create new network
  const networkId = await createNetwork(networkName)
  await db
    .update(projectTable)
    .set({ dockerNetworkId: networkId })
    .where(eq(projectTable.id, projectId))

  logger.info({ projectId, networkName, networkId }, 'Created project network')
  return networkId
}

/**
 * Connect a container to the project's Docker network.
 */
export async function connectContainerToProjectNetwork(
  containerId: string,
  projectId: string,
  projectSlug: string,
): Promise<void> {
  const networkId = await ensureProjectNetwork(projectId, projectSlug)
  await connectToNetwork(containerId, networkId)
}
