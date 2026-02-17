import type { Service, ServiceConnection, Volume } from '@mizu/minato-domain'
import type { ComposeService } from '../types'

interface ImageSourceConfig {
  image: string
  tag?: string
}

interface GitSourceConfig {
  repository: string
  branch?: string
  dockerfile?: string
  buildCommand?: string
}

interface PortMapping {
  container: number
  host?: number
  protocol?: 'tcp' | 'udp'
}

interface VolumeMount {
  volumeId: string
  containerPath: string
}

/**
 * Transform a Mizu service to a Docker Compose service definition.
 */
export function transformService(
  service: Service,
  connections: ServiceConnection[],
  volumes: Volume[],
  envGroups: Map<string, Record<string, string>>,
): ComposeService {
  const composeService: ComposeService = {}

  // Handle source type (image or build)
  const sourceConfig = service.sourceConfig as ImageSourceConfig | GitSourceConfig

  if (service.sourceType === 'image' || service.sourceType === 'template') {
    const imgConfig = sourceConfig as ImageSourceConfig
    composeService.image = imgConfig.tag ? `${imgConfig.image}:${imgConfig.tag}` : imgConfig.image
  } else if (service.sourceType === 'git') {
    const gitConfig = sourceConfig as GitSourceConfig
    composeService.build = {
      context: '.',
      dockerfile: gitConfig.dockerfile || 'Dockerfile',
    }
  }

  // Container name (sanitize: lowercase, replace spaces/special chars with dashes)
  const safeName = service.name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
  composeService.container_name = `mizu-${safeName}`

  // Port mappings
  const ports = service.ports as PortMapping[] | undefined
  if (ports && ports.length > 0) {
    composeService.ports = ports.map((p) => {
      const protocol = p.protocol ? `/${p.protocol}` : ''
      if (p.host) {
        return `${p.host}:${p.container}${protocol}`
      }
      return `${p.container}${protocol}`
    })
  }

  // Volume mounts
  const volumeMounts = service.volumeMounts as VolumeMount[] | undefined
  if (volumeMounts && volumeMounts.length > 0) {
    composeService.volumes = volumeMounts.map((vm) => {
      const volume = volumes.find((v) => v.id === vm.volumeId)
      const volumeName = volume?.dockerVolumeName || volume?.name || vm.volumeId
      return `${volumeName}:${vm.containerPath}`
    })
  }

  // Environment variables
  const envVars: Record<string, string> = {}

  // Add service's own env vars (decrypted)
  if (service.envVars) {
    try {
      const parsed = JSON.parse(service.envVars) as Record<string, string>
      Object.assign(envVars, parsed)
    } catch {
      // envVars might already be decrypted object or invalid
    }
  }

  // Add env groups linked to this service
  const serviceConnections = connections.filter(
    (c) => c.fromServiceId === service.id && c.targetType === 'env_group',
  )
  for (const conn of serviceConnections) {
    if (conn.toEnvGroupId) {
      const groupVars = envGroups.get(conn.toEnvGroupId)
      if (groupVars) {
        Object.assign(envVars, groupVars)
      }
    }
  }

  if (Object.keys(envVars).length > 0) {
    composeService.environment = envVars
  }

  // Dependencies (depends_on)
  const dependsOn = connections
    .filter(
      (c) =>
        c.fromServiceId === service.id &&
        c.connectionType === 'depends' &&
        (c.targetType === 'service' || c.targetType === 'database'),
    )
    .map((c) => c.toServiceId || c.toDatabaseId)
    .filter((id): id is string => !!id)

  if (dependsOn.length > 0) {
    composeService.depends_on = dependsOn
  }

  // Networks
  const networkConnections = connections.filter(
    (c) => c.fromServiceId === service.id && c.targetType === 'network' && c.toNetworkId,
  )
  if (networkConnections.length > 0) {
    composeService.networks = networkConnections
      .map((c) => c.toNetworkId)
      .filter((id): id is string => id != null)
  }

  // Default restart policy
  composeService.restart = 'unless-stopped'

  return composeService
}
