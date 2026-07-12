import type {
  Database,
  EnvGroup,
  ExternalService,
  Network,
  Project,
  Service,
  ServiceConnection,
  Volume,
} from '@mizu/nagare-domain'

/**
 * Complete project manifest with all entities.
 * This is the source of truth loaded from/saved to files.
 */
export interface ProjectManifest {
  /** The owning team (better-auth organization); slug = organization id. */
  team: { name: string; slug: string }
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
  'mizu.yml': string
  '.env': string
  '.env.example': string
}

/**
 * Options for file generation.
 */
export interface GenerationOptions {
  /** Include comments in generated files */
  includeComments?: boolean
  /** Generate only specified files */
  only?: (keyof GeneratedFiles)[]
}
