import { createLogger } from '@mizu/logger'
import { type ImageSourceConfig, projectTable, serviceTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import {
  createContainer,
  removeContainer,
  startContainer,
  stopContainer,
} from '../../docker/containers'
import { resolveConnectionEnvVars } from '../../docker/env-resolution'
import { pullImage } from '../../docker/images'
import { ensureProjectNetwork, sanitizeDockerName } from '../../docker/project-network'
import { decrypt } from '../../shared/crypto'

const logger = createLogger('service:deploy-service')

export interface DeploymentResult {
  success: boolean
  containerId?: string
  error?: string
}

/**
 * Deploys a service by:
 * 1. Pull image based on sourceType
 * 2. Ensure project network
 * 3. Resolve connection env vars
 * 4. Create container with config
 * 5. Start container
 * 6. Update service status
 */
export const deployService = async (serviceId: string): Promise<DeploymentResult> => {
  // Get service + parent project
  const [service] = await db.select().from(serviceTable).where(eq(serviceTable.id, serviceId))

  if (!service) {
    return { success: false, error: 'Service not found' }
  }

  const [project] = await db
    .select()
    .from(projectTable)
    .where(eq(projectTable.id, service.projectId))

  if (!project) {
    return { success: false, error: 'Parent project not found' }
  }

  try {
    // If there's an existing container, remove it first (stale deploy cleanup)
    if (service.containerId) {
      try {
        await stopContainer(service.containerId)
      } catch {
        // Container may already be stopped
      }
      try {
        await removeContainer(service.containerId, true)
      } catch {
        // Container may already be removed
      }
    }

    // Only image source type is supported for now
    if (service.sourceType !== 'image') {
      return { success: false, error: `Source type '${service.sourceType}' is not yet implemented` }
    }

    const sourceConfig = service.sourceConfig as ImageSourceConfig

    // 1. Set status → building
    await db.update(serviceTable).set({ status: 'building' }).where(eq(serviceTable.id, serviceId))

    // 2. Pull image
    const imageTag = sourceConfig.tag || 'latest'
    await pullImage(sourceConfig.image, imageTag)

    // 3. Ensure project network
    await db.update(serviceTable).set({ status: 'starting' }).where(eq(serviceTable.id, serviceId))

    const networkName = `mizu-${sanitizeDockerName(project.slug)}`
    await ensureProjectNetwork(project.id, project.slug)

    // 4. Resolve connection env vars + merge user env vars
    const connectionEnvVars = await resolveConnectionEnvVars(serviceId, project.slug)

    let userEnvVars: Record<string, string> = {}
    if (service.envVars) {
      try {
        userEnvVars = JSON.parse(decrypt(service.envVars))
      } catch {
        logger.warn({ serviceId }, 'Failed to decrypt env vars, trying as plain JSON')
        try {
          userEnvVars = JSON.parse(service.envVars)
        } catch {
          logger.warn({ serviceId }, 'Failed to parse env vars')
        }
      }
    }

    const env = { ...connectionEnvVars, ...userEnvVars }

    // 5. Build container config
    const containerName = `mizu-${sanitizeDockerName(project.slug)}-${sanitizeDockerName(service.name)}`

    const ports =
      (service.ports as Array<{ container: number; host: number; protocol?: string }>) || []

    const containerId = await createContainer({
      name: containerName,
      image: `${sourceConfig.image}:${imageTag}`,
      env,
      ports: ports.map((p) => ({
        containerPort: p.container,
        hostPort: p.host,
        protocol: (p.protocol as 'tcp' | 'udp') || 'tcp',
      })),
      network: networkName,
      restartPolicy: 'unless-stopped',
      labels: {
        'mizu.managed': 'true',
        'mizu.project': project.id,
        'mizu.entity': serviceId,
        'mizu.entity.type': 'service',
      },
    })

    // 6. Start container
    await startContainer(containerId)

    // 7. Update DB
    await db
      .update(serviceTable)
      .set({ status: 'running', containerId })
      .where(eq(serviceTable.id, serviceId))

    logger.info({ serviceId, containerId, containerName }, 'Service deployed successfully')
    return { success: true, containerId }
  } catch (error) {
    await db.update(serviceTable).set({ status: 'error' }).where(eq(serviceTable.id, serviceId))

    const message = error instanceof Error ? error.message : 'Unknown deployment error'
    logger.error({ serviceId, error: message }, 'Service deployment failed')
    return { success: false, error: message }
  }
}
