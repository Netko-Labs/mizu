/**
 * Mizu's first-party container runtime types, built on Apple's `container` CLI.
 * The runtime replaces dockerode; shapes are kept close to the old docker
 * module so callers stay simple.
 */

/**
 * Port mapping configuration for containers.
 * Apple `container` has no ephemeral host-port publish — entries without a
 * hostPort are not published (the container stays reachable on its network).
 */
export interface PortMapping {
  /** Host port to expose — omit to skip publishing (network-only reachability) */
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
  /** Named volume or host path */
  source: string
  /** Container path to mount to */
  target: string
  /** Whether the mount is read-only */
  readonly?: boolean
}

/**
 * Resource limits for containers
 */
export interface ResourceLimits {
  /** Memory limit (e.g., '512m', '1g') */
  memory?: string
  /** CPU count (e.g., '2') */
  cpus?: string
}

/**
 * Options for creating a new container.
 * No restartPolicy (the supervisor owns restarts) and no healthCheck (the
 * deploy paths use exec-based readiness probes) — Apple `container` supports
 * neither natively.
 */
export interface ContainerCreateOptions {
  /** Name for the container — under Apple container the name IS the id */
  name: string
  /** Image reference (e.g., 'nginx:latest'; qualified automatically) */
  image: string
  /** Command to run in the container */
  cmd?: string[]
  /** Environment variables */
  env?: Record<string, string>
  /** Port mappings */
  ports?: PortMapping[]
  /** Volume mounts */
  volumes?: VolumeMount[]
  /** Network to attach to (attach happens at create; no post-hoc connect) */
  network?: string
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
 * Container running state (Apple `container` status.state values + fallbacks)
 */
export type ContainerState = 'created' | 'running' | 'stopping' | 'stopped' | 'unknown'

/**
 * Current status of a container
 */
export interface ContainerStatus {
  /** Container id (= name) */
  id: string
  /** Container name */
  name: string
  /** Current state */
  state: ContainerState
  /** Whether the container is running */
  running: boolean
  /** When the container was started */
  startedAt: string | null
  /** Primary IPv4 address on its network (no CIDR suffix), when running */
  ipv4Address: string | null
}

/**
 * Log entry from container output.
 * Apple `container logs` has no timestamps and no stream separation:
 * timestamp is receipt time and stream is always 'stdout'.
 */
export interface LogEntry {
  /** Timestamp of the log entry (receipt time) */
  timestamp: Date
  /** Which stream the log came from (always 'stdout' under Apple container) */
  stream: 'stdout' | 'stderr'
  /** Log message content */
  message: string
}

/**
 * Defensive shape of `container inspect` / `container ls --format json`
 * entries. Stopped containers may lack status.networks; inspect may return an
 * object or a one-element array.
 */
export interface InspectPayload {
  configuration?: {
    id?: string
    image?: { reference?: string }
    labels?: Record<string, string>
    initProcess?: { environment?: string[] }
  }
  status?: {
    state?: string
    startedDate?: string
    networks?: Array<{
      network?: string
      hostname?: string
      ipv4Address?: string
      ipv4Gateway?: string
    }>
  }
}

/**
 * Result of a runtime CLI invocation
 */
export interface CliResult {
  stdout: string
  stderr: string
}

/**
 * Options for a runtime CLI invocation
 */
export interface CliOptions {
  /** Kill the process after this many ms (default CLI_DEFAULT_TIMEOUT_MS) */
  timeoutMs?: number
}

/**
 * Summary of the runtime for dashboards
 */
export interface RuntimeInfoResult {
  version: string
  containers: number
  containersRunning: number
  images: number
}

/**
 * Error thrown by runtime operations
 */
export class RuntimeError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'RuntimeError'
  }
}
