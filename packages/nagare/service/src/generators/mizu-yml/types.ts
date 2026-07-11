/**
 * Shape of an image-based service's `sourceConfig` jsonb.
 */
export interface ImageSourceConfig {
  image?: string
  tag?: string
}

/**
 * Shape of a service's `ports` jsonb entries.
 */
export interface PortMapping {
  container: number
  host?: number
  protocol?: 'tcp' | 'udp'
}

/**
 * Shape of a service's `volumeMounts` jsonb entries.
 */
export interface VolumeMount {
  volumeId: string
  containerPath: string
}

/**
 * Subset of `project.settings` the generator reads.
 */
export interface ProjectSettings {
  serviceGroups?: Array<{
    id: string
    name: string
    memberNodeIds?: string[]
  }>
}
