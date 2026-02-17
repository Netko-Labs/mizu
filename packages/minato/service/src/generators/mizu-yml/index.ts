import yaml from 'js-yaml'
import type { GenerationOptions, MizuServiceConfig, MizuYmlFile, ProjectManifest } from '../types'

interface ProjectSettings {
  profiles?: Array<{ name: string; variables: Record<string, string> }>
  mesh?: MizuYmlFile['mesh']
  deployment?: MizuYmlFile['deployment']
  serviceGroups?: Array<{
    id: string
    name: string
    memberNodeIds?: string[]
  }>
}

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

/**
 * Generate a mizu.yml file from a project manifest.
 *
 * mizu.yml handles advanced orchestration features:
 * - Deployment hooks (pre/post deploy, rollback)
 * - Health checks
 * - Scaling configuration
 * - Service mesh settings
 * - Deployment strategies
 */
export function generateMizuYml(
  manifest: ProjectManifest,
  options: GenerationOptions = {},
): string {
  const { includeComments = true } = options

  const mizuFile: MizuYmlFile = {
    version: '1.0',
    project: {
      name: manifest.project.name,
      slug: manifest.project.slug,
      workspace: manifest.workspace.slug,
    },
  }

  // Extract profiles from project settings
  const settings = parseProjectSettings(manifest.project.settings)

  if (settings?.profiles && settings.profiles.length > 0) {
    mizuFile.profiles = settings.profiles
  }

  // Build service configurations from services
  const serviceConfigs: MizuServiceConfig[] = []
  const serviceNameById = new Map(manifest.services.map((service) => [service.id, service.name]))
  const databaseNameById = new Map(
    manifest.databases.map((database) => [database.id, database.name]),
  )

  // Build service dependency map from manual canvas connections
  const dependencyNamesByServiceId = new Map<string, Set<string>>()
  for (const connection of manifest.connections) {
    if (connection.connectionType !== 'depends') {
      continue
    }
    if (!serviceNameById.has(connection.fromServiceId)) {
      continue
    }

    const targetName = connection.toServiceId
      ? serviceNameById.get(connection.toServiceId)
      : connection.toDatabaseId
        ? databaseNameById.get(connection.toDatabaseId)
        : undefined

    if (!targetName) {
      continue
    }

    const existing = dependencyNamesByServiceId.get(connection.fromServiceId) ?? new Set<string>()
    existing.add(targetName)
    dependencyNamesByServiceId.set(connection.fromServiceId, existing)
  }

  for (const service of manifest.services) {
    const serviceSettings = (service.sourceConfig as Record<string, unknown>) || {}
    const config: MizuServiceConfig = {
      name: service.name,
    }

    // Extract hooks from service settings
    const hooks = serviceSettings.hooks as MizuServiceConfig['hooks']
    if (hooks) {
      config.hooks = hooks
    }

    // Extract health check from service settings
    const healthCheck = serviceSettings.healthCheck as MizuServiceConfig['healthCheck']
    if (healthCheck) {
      config.healthCheck = healthCheck
    }

    // Extract scaling from service settings
    const scaling = serviceSettings.scaling as MizuServiceConfig['scaling']
    if (scaling) {
      config.scaling = scaling
    }

    // Extract auto discovery from service settings
    const autoDiscovery = serviceSettings.autoDiscovery as MizuServiceConfig['autoDiscovery']
    if (autoDiscovery) {
      config.autoDiscovery = autoDiscovery
    }

    const dependsOn = dependencyNamesByServiceId.get(service.id)
    if (dependsOn && dependsOn.size > 0) {
      config.dependsOn = Array.from(dependsOn)
    }

    // Only add if there's meaningful configuration
    if (
      config.hooks ||
      config.healthCheck ||
      config.scaling ||
      config.autoDiscovery ||
      config.dependsOn
    ) {
      serviceConfigs.push(config)
    }
  }

  if (serviceConfigs.length > 0) {
    mizuFile.services = serviceConfigs
  }

  // Service groups (Railway-style one-click app bundles)
  if (settings.serviceGroups && settings.serviceGroups.length > 0) {
    const groupConfigs = settings.serviceGroups
      .flatMap((group) => {
        const memberNodeIds = Array.isArray(group.memberNodeIds)
          ? group.memberNodeIds.filter((member): member is string => typeof member === 'string')
          : []

        const services = memberNodeIds
          .map((memberId) => serviceNameById.get(memberId))
          .filter((name): name is string => !!name)
        const databases = memberNodeIds
          .map((memberId) => databaseNameById.get(memberId))
          .filter((name): name is string => !!name)

        if (!group.name || (services.length === 0 && databases.length === 0)) {
          return []
        }

        return [
          {
            name: group.name,
            ...(services.length > 0 && { services: Array.from(new Set(services)) }),
            ...(databases.length > 0 && { databases: Array.from(new Set(databases)) }),
          },
        ]
      })
      .filter((group) => group.services || group.databases)

    if (groupConfigs.length > 0) {
      mizuFile.serviceGroups = groupConfigs
    }
  }

  // Mesh configuration
  if (settings?.mesh) {
    mizuFile.mesh = settings.mesh
  }

  // Deployment configuration
  if (settings?.deployment) {
    mizuFile.deployment = settings.deployment
  }

  // Convert to YAML
  let yamlContent = yaml.dump(mizuFile, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
    quotingType: '"',
    forceQuotes: false,
  })

  // Add header comment
  if (includeComments) {
    const header = [
      '# Mizu orchestration configuration',
      `# Project: ${manifest.project.name}`,
      '#',
      '# This file configures advanced deployment features:',
      '# - Dependencies: Manual service-to-service/database graph from canvas',
      '# - Service groups: One-click app bundles (containers + databases)',
      '# - Hooks: Scripts to run before/after deployments',
      '# - Health checks: Service health monitoring',
      '# - Scaling: Auto-scaling thresholds',
      '# - Mesh: Service discovery and load balancing',
      '#',
      '',
    ].join('\n')

    yamlContent = header + yamlContent
  }

  return yamlContent
}

/**
 * Parse a mizu.yml file content into a structured object.
 */
export function parseMizuYml(content: string): MizuYmlFile {
  return yaml.load(content) as MizuYmlFile
}

export { type MizuYml, MizuYmlSchema } from './schema'
