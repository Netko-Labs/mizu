/**
 * Docker orchestration service for Mizu
 *
 * Provides a high-level API for managing Docker containers, images,
 * networks, and volumes for the Mizu self-hosting platform.
 *
 * @example
 * ```typescript
 * import {
 *   createContainer,
 *   startContainer,
 *   pullImage,
 *   dockerEvents
 * } from '@mizu/nagare-service'
 *
 * // Pull an image
 * await pullImage('nginx', 'latest', (progress) => {
 *   console.log(progress.status, progress.progress)
 * })
 *
 * // Create and start a container
 * const containerId = await createContainer({
 *   name: 'my-nginx',
 *   image: 'nginx:latest',
 *   ports: [{ hostPort: 8080, containerPort: 80 }],
 *   env: { NGINX_HOST: 'localhost' }
 * })
 *
 * await startContainer(containerId)
 *
 * // Subscribe to events
 * for await (const event of dockerEvents.subscribe({ type: 'container' })) {
 *   console.log(event.action, event.actorId)
 * }
 * ```
 */

// Client exports
export { getDockerClient, getDockerInfo, isDockerAvailable } from './client'
// Container operations
export {
  createContainer,
  getContainerLogs,
  getContainerStatus,
  inspectContainer,
  removeContainer,
  restartContainer,
  startContainer,
  stopContainer,
  streamContainerLogs,
} from './containers'
// Connection env var resolution
export { resolveConnectionEnvVars } from './env-resolution'
// Events
export { dockerEvents, waitForContainerEvent } from './events'

// Image operations
export {
  buildImage,
  imageExists,
  inspectImage,
  listImages,
  pruneImages,
  pullImage,
  removeImage,
  tagImage,
} from './images'
// Network operations
export {
  connectToNetwork,
  createNetwork,
  disconnectFromNetwork,
  inspectNetwork,
  listNetworks,
  networkExists,
  removeNetwork,
} from './networks'
// Project network management
export {
  connectContainerToProjectNetwork,
  ensureProjectNetwork,
  getProjectNetworkName,
  sanitizeDockerName,
} from './project-network'
// Types
export type {
  ContainerAction,
  // Container types
  ContainerCreateOptions,
  ContainerHealthStatus,
  ContainerInfo,
  ContainerState,
  ContainerStatus,
  // Event types
  DockerEvent,
  DockerEventFilter,
  DockerEventType,
  HealthCheck,
  ImageAction,
  LogEntry,
  NetworkAction,
  PortMapping,
  // Image types
  PullProgress,
  ResourceLimits,
  VolumeAction,
  VolumeMount,
} from './types'
export { DockerError } from './types'
// Volume operations
export {
  createVolume,
  inspectVolume,
  listVolumes,
  pruneVolumes,
  removeVolume,
  volumeExists,
} from './volumes'
