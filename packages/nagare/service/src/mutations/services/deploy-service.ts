import { basename, join } from 'node:path'
import { createLogger } from '@mizu/logger'
import { type ImageSourceConfig, projectTable, serviceTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { ensureDir, getMizuHome, writeFileAtomic } from '../../filesystem'
import { syncIngressSafe } from '../../ingress'
import { getDeployContext } from '../../queries/environments'
import {
  createContainer,
  ensureDeployNetwork,
  entityContainerName,
  MIZU_LABELS,
  pullImage,
  removeContainer,
  resolveConnectionEnvVars,
  startContainer,
  stopContainer,
} from '../../runtime'
import { decrypt } from '../../shared/crypto'

const logger = createLogger('service:deploy-service')

/** A filesystem-safe host dir name derived from a container path. */
function volumeDirName(containerPath: string): string {
  return containerPath.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/^-+/, '') || 'root'
}

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

  // Everything this service deploys (container, network, peer lookups) lives in
  // its environment's namespace, isolated from the project's other environments.
  const deployCtx = await getDeployContext(service.environmentId)
  if (!deployCtx) {
    return { success: false, error: 'Environment not found' }
  }
  const { namespace } = deployCtx

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

    const networkName = await ensureDeployNetwork(namespace)

    // 4. Resolve connection env vars + merge user env vars
    const connectionEnvVars = await resolveConnectionEnvVars(serviceId, namespace)

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
    const containerName = entityContainerName(namespace, service.name)

    // Guard against name collisions from a lost containerId (best-effort)
    await removeContainer(containerName, true).catch(() => {})

    const ports =
      (service.ports as Array<{ container: number; host?: number; protocol?: string }>) || []

    // Seed any template config files onto the host and bind-mount them — some
    // images (e.g. CLIProxyAPI) won't boot without a config file.
    const serviceDir = join(getMizuHome(), 'services', serviceId)
    const configFiles =
      (service.sourceConfig as { configFiles?: Array<{ path: string; content: string }> })
        .configFiles ?? []
    const volumes: Array<{ source: string; target: string }> = []
    if (configFiles.length) {
      await ensureDir(serviceDir)
      for (const file of configFiles) {
        const hostPath = join(serviceDir, basename(file.path))
        await writeFileAtomic(hostPath, file.content)
        volumes.push({ source: hostPath, target: file.path })
      }
    }

    // Persistent volumes: template-declared container dirs that must survive
    // redeploys (provider auth, plugins). Back each with a host dir under the
    // service's mizu home — reused across deploys, so its contents outlive the
    // container.
    const persistentVolumes = (service.sourceConfig as { volumes?: string[] }).volumes ?? []
    for (const containerPath of persistentVolumes) {
      const hostDir = join(serviceDir, 'volumes', volumeDirName(containerPath))
      await ensureDir(hostDir)
      volumes.push({ source: hostDir, target: containerPath })
    }

    const containerId = await createContainer({
      name: containerName,
      image: `${sourceConfig.image}:${imageTag}`,
      env,
      ports: ports.map((p) => ({
        containerPort: p.container,
        hostPort: p.host,
        protocol: (p.protocol as 'tcp' | 'udp') || 'tcp',
      })),
      volumes,
      network: networkName,
      labels: {
        [MIZU_LABELS.managed]: 'true',
        [MIZU_LABELS.project]: project.id,
        [MIZU_LABELS.entity]: serviceId,
        [MIZU_LABELS.entityType]: 'service',
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
    syncIngressSafe()
    return { success: true, containerId }
  } catch (error) {
    await db.update(serviceTable).set({ status: 'error' }).where(eq(serviceTable.id, serviceId))

    const message = error instanceof Error ? error.message : 'Unknown deployment error'
    logger.error({ serviceId, error: message }, 'Service deployment failed')
    return { success: false, error: message }
  }
}
