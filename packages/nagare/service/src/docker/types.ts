/**
 * Docker orchestration types for Mizu
 * These types define the shape of data used across the Docker service layer.
 */

/**
 * Port mapping configuration for containers
 */
export interface PortMapping {
  /** Host port to expose — omit to let Docker assign an ephemeral port */
  hostPort?: number
  /** Container port to map */
  containerPort: number
  /** Protocol (tcp or udp) */
  protocol?: 'tcp' | 'udp'
}

/**
 * Volume mount configuration for containers
 */
export interface VolumeMount {
  /** Host path or volume name */
  source: string
  /** Container path to mount to */
  target: string
  /** Whether the mount is read-only */
  readonly?: boolean
}

/**
 * Health check configuration for containers
 */
export interface HealthCheck {
  /** Command to run for health check */
  test: string[]
  /** Interval between health checks in seconds */
  interval?: number
  /** Timeout for each health check in seconds */
  timeout?: number
  /** Number of retries before marking unhealthy */
  retries?: number
  /** Start period before health checks begin in seconds */
  startPeriod?: number
}

/**
 * Resource limits for containers
 */
export interface ResourceLimits {
  /** Memory limit (e.g., '512m', '1g') */
  memory?: string
  /** CPU limit (e.g., '0.5', '2') */
  cpus?: string
}

/**
 * Options for creating a new container
 */
export interface ContainerCreateOptions {
  /** Name for the container */
  name: string
  /** Docker image to use (e.g., 'nginx:latest') */
  image: string
  /** Command to run in the container */
  cmd?: string[]
  /** Environment variables */
  env?: Record<string, string>
  /** Port mappings */
  ports?: PortMapping[]
  /** Volume mounts */
  volumes?: VolumeMount[]
  /** Network to connect to */
  network?: string
  /** Restart policy */
  restartPolicy?: 'no' | 'always' | 'unless-stopped' | 'on-failure'
  /** Health check configuration */
  healthCheck?: HealthCheck
  /** Resource limits */
  resources?: ResourceLimits
  /** Labels to add to the container */
  labels?: Record<string, string>
  /** Working directory inside the container */
  workingDir?: string
  /** User to run as inside the container */
  user?: string
}

/**
 * Container health status
 */
export type ContainerHealthStatus = 'healthy' | 'unhealthy' | 'starting' | 'none'

/**
 * Container running state
 */
export type ContainerState =
  | 'created'
  | 'running'
  | 'paused'
  | 'restarting'
  | 'removing'
  | 'exited'
  | 'dead'

/**
 * Current status of a container
 */
export interface ContainerStatus {
  /** Container ID */
  id: string
  /** Container name */
  name: string
  /** Current state */
  state: ContainerState
  /** Health status if configured */
  health: ContainerHealthStatus
  /** Whether the container is running */
  running: boolean
  /** When the container was started */
  startedAt: string | null
  /** When the container finished (if exited) */
  finishedAt: string | null
  /** Exit code if exited */
  exitCode: number | null
  /** Mapped ports */
  ports: PortMapping[]
}

/**
 * Detailed container information
 */
export interface ContainerInfo extends ContainerStatus {
  /** Docker image used */
  image: string
  /** Container labels */
  labels: Record<string, string>
  /** Environment variables (names only, values may be redacted) */
  env: string[]
  /** Connected networks */
  networks: string[]
  /** Volume mounts */
  mounts: VolumeMount[]
  /** Creation timestamp */
  createdAt: string
  /** Restart count */
  restartCount: number
}

/**
 * Log entry from container output
 */
export interface LogEntry {
  /** Timestamp of the log entry */
  timestamp: Date
  /** Which stream the log came from */
  stream: 'stdout' | 'stderr'
  /** Log message content */
  message: string
}

/**
 * Progress information during image pull
 */
export interface PullProgress {
  /** Current status message */
  status: string
  /** Progress message (e.g., 'Downloading', 'Extracting') */
  progress?: string
  /** Current bytes downloaded/extracted */
  current?: number
  /** Total bytes to download/extract */
  total?: number
  /** Layer ID being processed */
  id?: string
}

/**
 * Docker event types
 */
export type DockerEventType = 'container' | 'image' | 'network' | 'volume'

/**
 * Container-specific event actions
 */
export type ContainerAction =
  | 'attach'
  | 'commit'
  | 'copy'
  | 'create'
  | 'destroy'
  | 'detach'
  | 'die'
  | 'exec_create'
  | 'exec_detach'
  | 'exec_die'
  | 'exec_start'
  | 'export'
  | 'health_status'
  | 'kill'
  | 'oom'
  | 'pause'
  | 'rename'
  | 'resize'
  | 'restart'
  | 'start'
  | 'stop'
  | 'top'
  | 'unpause'
  | 'update'

/**
 * Image-specific event actions
 */
export type ImageAction = 'delete' | 'import' | 'load' | 'pull' | 'push' | 'save' | 'tag' | 'untag'

/**
 * Network-specific event actions
 */
export type NetworkAction = 'connect' | 'create' | 'destroy' | 'disconnect' | 'remove'

/**
 * Volume-specific event actions
 */
export type VolumeAction = 'create' | 'destroy' | 'mount' | 'unmount'

/**
 * A Docker event from the event stream
 */
export interface DockerEvent {
  /** Type of resource the event is about */
  type: DockerEventType
  /** Action that occurred */
  action: string
  /** ID of the resource (container ID, image ID, etc.) */
  actorId: string
  /** Additional attributes about the event */
  attributes: Record<string, string>
  /** Unix timestamp of when the event occurred */
  time: number
  /** Nanosecond precision timestamp */
  timeNano?: number
}

/**
 * Filter options for Docker events
 */
export interface DockerEventFilter {
  /** Filter by event type */
  type?: DockerEventType | DockerEventType[]
  /** Filter by container name or ID */
  container?: string | string[]
  /** Filter by image name */
  image?: string | string[]
  /** Filter by network name or ID */
  network?: string | string[]
  /** Filter by volume name */
  volume?: string | string[]
  /** Filter by labels */
  label?: string | string[]
  /** Filter by event action */
  event?: string | string[]
}

/**
 * Error thrown by Docker operations
 */
export class DockerError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message)
    this.name = 'DockerError'
  }
}
