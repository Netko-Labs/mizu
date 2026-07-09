import type {
  Database,
  EnvGroup,
  ExternalService,
  Network,
  Project,
  Service,
  ServiceConnection,
  Volume,
  Workspace,
} from '@mizu/nagare-domain'

/**
 * Complete project manifest with all entities.
 * This is the source of truth loaded from/saved to files.
 */
export interface ProjectManifest {
  workspace: Pick<Workspace, 'name' | 'slug'>
  project: Pick<Project, 'name' | 'slug' | 'description' | 'settings'>
  services: Service[]
  databases: Database[]
  volumes: Volume[]
  networks: Network[]
  envGroups: EnvGroup[]
  externalServices: ExternalService[]
  connections: ServiceConnection[]
}

/**
 * Generated output files from a project manifest.
 */
export interface GeneratedFiles {
  'docker-compose.yml': string
  'mizu.yml': string
  '.env': string
  '.env.example': string
}

/**
 * Options for YAML generation.
 */
export interface GenerationOptions {
  /** Include comments in generated files */
  includeComments?: boolean
  /** Profile to use (development, staging, production) */
  profile?: 'development' | 'staging' | 'production'
  /** Generate only specified files */
  only?: (keyof GeneratedFiles)[]
}

/**
 * Docker Compose service definition.
 * Note: Property names use snake_case to match docker-compose.yml format.
 */
export interface ComposeService {
  image?: string
  build?: {
    context: string
    dockerfile?: string
    args?: Record<string, string>
  }
  container_name?: string
  ports?: string[]
  volumes?: string[]
  environment?: Record<string, string> | string[]
  env_file?: string[]
  depends_on?: string[] | Record<string, { condition: string }>
  networks?: string[]
  restart?: 'no' | 'always' | 'on-failure' | 'unless-stopped'
  healthcheck?: {
    test: string | string[]
    interval?: string
    timeout?: string
    retries?: number
    start_period?: string
  }
  labels?: Record<string, string>
  command?: string | string[]
}

/**
 * Docker Compose network definition.
 * Note: Property names use snake_case to match docker-compose.yml format.
 */
export interface ComposeNetwork {
  driver?: 'bridge' | 'host' | 'overlay' | 'macvlan' | 'none'
  driver_opts?: Record<string, string>
  ipam?: {
    driver?: string
    config?: Array<{
      subnet?: string
      gateway?: string
    }>
  }
  internal?: boolean
  external?: boolean
}

/**
 * Docker Compose volume definition.
 * Note: Property names use snake_case to match docker-compose.yml format.
 */
export interface ComposeVolume {
  driver?: string
  driver_opts?: Record<string, string>
  external?: boolean
  name?: string
}

/**
 * Complete Docker Compose file structure.
 */
export interface DockerComposeFile {
  version?: string
  name?: string
  services: Record<string, ComposeService>
  networks?: Record<string, ComposeNetwork>
  volumes?: Record<string, ComposeVolume>
}

/**
 * Mizu.yml hook configuration.
 */
export interface MizuHook {
  command: string
  timeout?: number
  continueOnFailure?: boolean
}

/**
 * Mizu.yml service configuration.
 */
export interface MizuServiceConfig {
  name: string
  dependsOn?: string[]
  hooks?: {
    preDeploy?: MizuHook[]
    postDeploy?: MizuHook[]
    rollback?: MizuHook[]
  }
  healthCheck?: {
    type: 'http' | 'tcp' | 'command'
    endpoint?: string
    command?: string
    interval?: number
    timeout?: number
    retries?: number
  }
  scaling?: {
    minInstances?: number
    maxInstances?: number
    cpuThreshold?: number
    memoryThreshold?: number
  }
  autoDiscovery?: {
    enabled: boolean
    protocol?: string
    port?: number
  }
}

/**
 * Mizu.yml service group configuration.
 * Groups represent one-click app bundles (services + databases).
 */
export interface MizuServiceGroupConfig {
  name: string
  services?: string[]
  databases?: string[]
}

/**
 * Mizu.yml mesh configuration.
 */
export interface MizuMeshConfig {
  enabled: boolean
  discovery?: 'static' | 'dns' | 'consul'
  loadBalancing?: 'round-robin' | 'least-connections' | 'random'
}

/**
 * Mizu.yml deployment configuration.
 */
export interface MizuDeploymentConfig {
  strategy?: 'rolling' | 'blue-green' | 'recreate'
  maxUnavailable?: number
  maxSurge?: number
}

/**
 * Complete Mizu.yml file structure.
 */
export interface MizuYmlFile {
  version: '1.0'
  project: {
    name: string
    slug: string
    workspace: string
  }
  profiles?: Array<{
    name: string
    variables: Record<string, string>
  }>
  services?: MizuServiceConfig[]
  serviceGroups?: MizuServiceGroupConfig[]
  mesh?: MizuMeshConfig
  deployment?: MizuDeploymentConfig
}
