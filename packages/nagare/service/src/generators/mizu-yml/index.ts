import yaml from 'js-yaml'
import { getIngressBaseDomain, serviceIngressHost } from '../../ingress'
import { sanitizeName } from '../../runtime'
import type { GenerationOptions, ProjectManifest } from '../types'
import { type MizuYml, MizuYmlSchema } from './schema'
import type { ImageSourceConfig, PortMapping, ProjectSettings, VolumeMount } from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseProjectSettings(settings: unknown): ProjectSettings {
  if (isRecord(settings)) {
    return settings as ProjectSettings
  }

  if (typeof settings === 'string') {
    try {
      const parsed = JSON.parse(settings) as unknown
      if (isRecord(parsed)) {
        return parsed as ProjectSettings
      }
    } catch {
      return {}
    }
  }

  return {}
}

function parseEnvVarNames(envVars: string | null): string[] {
  if (!envVars) {
    return []
  }
  try {
    const parsed = JSON.parse(envVars) as Record<string, string>
    return isRecord(parsed) ? Object.keys(parsed).sort() : []
  } catch {
    // Encrypted or invalid JSON — omit rather than risk leaking values
    return []
  }
}

/**
 * Generate a mizu.yml v2 file from a project manifest.
 *
 * mizu.yml is the single manifest describing what nagare deploys: services
 * (image, ports, volumes, env var names, connections, ingress hosts),
 * databases, networks, and service groups. It is a display/export artifact —
 * env var VALUES never appear here; they live in .env.
 */
export async function generateMizuYml(
  manifest: ProjectManifest,
  options: GenerationOptions = {},
): Promise<string> {
  const { includeComments = true } = options

  const baseDomain = await getIngressBaseDomain()
  const settings = parseProjectSettings(manifest.project.settings)

  const serviceNameById = new Map(manifest.services.map((service) => [service.id, service.name]))
  const databaseNameById = new Map(
    manifest.databases.map((database) => [database.id, database.name]),
  )
  const volumeNameById = new Map(
    manifest.volumes.map((volume) => [volume.id, volume.volumeName || volume.name]),
  )

  const mizuFile: MizuYml = {
    version: 2,
    project: {
      name: manifest.project.name,
      slug: manifest.project.slug,
      workspace: manifest.workspace.slug,
    },
  }

  // Services keyed by name
  const services: NonNullable<MizuYml['services']> = {}
  for (const service of manifest.services) {
    const sourceConfig = (service.sourceConfig ?? {}) as ImageSourceConfig
    const serviceConnections = manifest.connections.filter(
      (connection) => connection.fromServiceId === service.id,
    )

    const ports = (service.ports as PortMapping[] | undefined) ?? []
    const volumeMounts = (service.volumeMounts as VolumeMount[] | undefined) ?? []
    const envNames = parseEnvVarNames(service.envVars)

    const connections = serviceConnections.flatMap((connection) => {
      if (!connection.envVarName) {
        return []
      }
      const targetName = connection.toServiceId
        ? serviceNameById.get(connection.toServiceId)
        : connection.toDatabaseId
          ? databaseNameById.get(connection.toDatabaseId)
          : undefined
      return targetName ? [{ to: targetName, env: connection.envVarName }] : []
    })

    const dependsOn = serviceConnections
      .filter((connection) => connection.connectionType === 'depends')
      .map((connection) =>
        connection.toServiceId
          ? serviceNameById.get(connection.toServiceId)
          : connection.toDatabaseId
            ? databaseNameById.get(connection.toDatabaseId)
            : undefined,
      )
      .filter((name): name is string => !!name)

    services[service.name] = {
      image: sourceConfig.image ?? service.name,
      tag: sourceConfig.tag ?? 'latest',
      ...(ports.length > 0 && {
        ports: ports.map((port) => ({
          container: port.container,
          ...(port.host !== undefined && { host: port.host }),
          protocol: port.protocol ?? 'tcp',
        })),
      }),
      ...(volumeMounts.length > 0 && {
        volumes: volumeMounts.map((mount) => ({
          source: volumeNameById.get(mount.volumeId) ?? mount.volumeId,
          target: mount.containerPath,
        })),
      }),
      ...(envNames.length > 0 && { env: envNames }),
      ...(connections.length > 0 && { connections }),
      ...(dependsOn.length > 0 && { dependsOn: Array.from(new Set(dependsOn)) }),
      ...(ports.length > 0 && {
        ingress: { host: serviceIngressHost(service.name, manifest.project.slug, baseDomain) },
      }),
    }
  }
  if (Object.keys(services).length > 0) {
    mizuFile.services = services
  }

  // Databases keyed by name
  const databases: NonNullable<MizuYml['databases']> = {}
  for (const database of manifest.databases) {
    databases[database.name] = {
      type: database.type,
      ...(database.version && { version: database.version }),
      ...(database.port !== null && database.port !== undefined && { port: database.port }),
    }
  }
  if (Object.keys(databases).length > 0) {
    mizuFile.databases = databases
  }

  // Networks: the implicit project network plus user-defined ones
  mizuFile.networks = [
    `mizu-${sanitizeName(manifest.project.slug)}`,
    ...manifest.networks.map((network) => network.name),
  ]

  // Service groups (one-click app bundles) from project settings
  if (settings.serviceGroups && settings.serviceGroups.length > 0) {
    const groupConfigs = settings.serviceGroups.flatMap((group) => {
      const memberNodeIds = Array.isArray(group.memberNodeIds)
        ? group.memberNodeIds.filter((member): member is string => typeof member === 'string')
        : []

      const groupServices = memberNodeIds
        .map((memberId) => serviceNameById.get(memberId))
        .filter((name): name is string => !!name)
      const groupDatabases = memberNodeIds
        .map((memberId) => databaseNameById.get(memberId))
        .filter((name): name is string => !!name)

      if (!group.name || (groupServices.length === 0 && groupDatabases.length === 0)) {
        return []
      }

      return [
        {
          name: group.name,
          ...(groupServices.length > 0 && { services: Array.from(new Set(groupServices)) }),
          ...(groupDatabases.length > 0 && { databases: Array.from(new Set(groupDatabases)) }),
        },
      ]
    })

    if (groupConfigs.length > 0) {
      mizuFile.serviceGroups = groupConfigs
    }
  }

  let yamlContent = yaml.dump(mizuFile, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
    quotingType: '"',
    forceQuotes: false,
  })

  if (includeComments) {
    yamlContent = `# mizu.yml — generated by mizu; describes what nagare deploys\n${yamlContent}`
  }

  return yamlContent
}

/**
 * Parse mizu.yml content into a validated MizuYml object.
 */
export function parseMizuYml(content: string): MizuYml {
  return MizuYmlSchema.parse(yaml.load(content))
}

export { type MizuYml, MizuYmlSchema } from './schema'
