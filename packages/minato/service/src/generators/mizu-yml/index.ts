import yaml from 'js-yaml'
import type { GenerationOptions, MizuServiceConfig, MizuYmlFile, ProjectManifest } from '../types'

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
  const settings = manifest.project.settings as {
    profiles?: Array<{ name: string; variables: Record<string, string> }>
    mesh?: MizuYmlFile['mesh']
    deployment?: MizuYmlFile['deployment']
  }

  if (settings?.profiles && settings.profiles.length > 0) {
    mizuFile.profiles = settings.profiles
  }

  // Build service configurations from services
  const serviceConfigs: MizuServiceConfig[] = []

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

    // Only add if there's meaningful configuration
    if (config.hooks || config.healthCheck || config.scaling || config.autoDiscovery) {
      serviceConfigs.push(config)
    }
  }

  if (serviceConfigs.length > 0) {
    mizuFile.services = serviceConfigs
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
