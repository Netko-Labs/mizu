/**
 * Image operations for Mizu Docker orchestration
 * Handles pulling, building, and managing Docker images.
 */

import { createLogger } from '@mizu/logger'
import { getDockerClient } from './client'
import { DockerError, type PullProgress } from './types'

const logger = createLogger('docker:images')

/**
 * Pull a Docker image from a registry
 * @param image Image name (e.g., 'nginx', 'postgres')
 * @param tag Image tag (default: 'latest')
 * @param onProgress Optional callback for progress updates
 */
export async function pullImage(
  image: string,
  tag = 'latest',
  onProgress?: (progress: PullProgress) => void,
): Promise<void> {
  const docker = getDockerClient()
  const fullImage = `${image}:${tag}`

  logger.info({ image: fullImage }, 'Pulling image')

  try {
    const stream = await docker.pull(fullImage)

    await new Promise<void>((resolve, reject) => {
      docker.modem.followProgress(
        stream,
        (error: Error | null) => {
          if (error) {
            reject(error)
          } else {
            resolve()
          }
        },
        (event: {
          id?: string
          status: string
          progress?: string
          progressDetail?: { current?: number; total?: number }
        }) => {
          if (onProgress) {
            onProgress({
              status: event.status,
              progress: event.progress,
              current: event.progressDetail?.current,
              total: event.progressDetail?.total,
              id: event.id,
            })
          }
        },
      )
    })

    logger.info({ image: fullImage }, 'Image pulled successfully')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ image: fullImage, error: message }, 'Failed to pull image')
    throw new DockerError(`Failed to pull image '${fullImage}': ${message}`)
  }
}

/**
 * Build a Docker image from a Dockerfile
 * @param dockerfile Path to Dockerfile or Dockerfile contents
 * @param context Build context path
 * @param tag Tag for the built image
 * @param onProgress Optional callback for build output
 */
export async function buildImage(
  dockerfile: string,
  context: string,
  tag: string,
  onProgress?: (output: string) => void,
): Promise<void> {
  const docker = getDockerClient()

  logger.info({ tag, context }, 'Building image')

  try {
    const stream = await docker.buildImage(
      {
        context,
        src: ['.'],
      },
      {
        t: tag,
        dockerfile,
        rm: true, // Remove intermediate containers
        forcerm: true, // Always remove intermediate containers
      },
    )

    await new Promise<void>((resolve, reject) => {
      docker.modem.followProgress(
        stream,
        (error: Error | null) => {
          if (error) {
            reject(error)
          } else {
            resolve()
          }
        },
        (event: { stream?: string; error?: string }) => {
          if (event.error) {
            reject(new Error(event.error))
          } else if (event.stream && onProgress) {
            onProgress(event.stream.trimEnd())
          }
        },
      )
    })

    logger.info({ tag }, 'Image built successfully')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ tag, error: message }, 'Failed to build image')
    throw new DockerError(`Failed to build image '${tag}': ${message}`)
  }
}

/**
 * Check if a Docker image exists locally
 * @param image Image name
 * @param tag Image tag (default: 'latest')
 * @returns true if image exists locally
 */
export async function imageExists(image: string, tag = 'latest'): Promise<boolean> {
  const docker = getDockerClient()
  const fullImage = `${image}:${tag}`

  try {
    const dockerImage = docker.getImage(fullImage)
    await dockerImage.inspect()
    return true
  } catch {
    // Image doesn't exist locally
    return false
  }
}

/**
 * Remove a Docker image
 * @param image Image name or ID
 * @param force Force removal even if in use
 */
export async function removeImage(image: string, force = false): Promise<void> {
  const docker = getDockerClient()

  logger.info({ image, force }, 'Removing image')

  try {
    const dockerImage = docker.getImage(image)
    await dockerImage.remove({ force })
    logger.info({ image }, 'Image removed')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ image, error: message }, 'Failed to remove image')
    throw new DockerError(`Failed to remove image '${image}': ${message}`)
  }
}

/**
 * List all Docker images
 * @returns Array of image information
 */
export async function listImages(): Promise<
  Array<{
    id: string
    repoTags: string[]
    size: number
    created: number
    labels: Record<string, string>
  }>
> {
  const docker = getDockerClient()

  try {
    const images = await docker.listImages()

    return images.map((image) => ({
      id: image.Id,
      repoTags: image.RepoTags || [],
      size: image.Size,
      created: image.Created,
      labels: image.Labels || {},
    }))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ error: message }, 'Failed to list images')
    throw new DockerError(`Failed to list images: ${message}`)
  }
}

/**
 * Inspect a Docker image
 * @param image Image name or ID
 * @returns Image details
 */
export async function inspectImage(image: string): Promise<{
  id: string
  repoTags: string[]
  size: number
  created: string
  config: {
    env: string[]
    cmd: string[]
    exposedPorts: string[]
    workingDir: string
    user: string
    labels: Record<string, string>
  }
  architecture: string
  os: string
}> {
  const docker = getDockerClient()

  try {
    const dockerImage = docker.getImage(image)
    const info = await dockerImage.inspect()

    return {
      id: info.Id,
      repoTags: info.RepoTags || [],
      size: info.Size,
      created: info.Created,
      config: {
        env: info.Config?.Env || [],
        cmd: info.Config?.Cmd || [],
        exposedPorts: Object.keys(info.Config?.ExposedPorts || {}),
        workingDir: info.Config?.WorkingDir || '',
        user: info.Config?.User || '',
        labels: info.Config?.Labels || {},
      },
      architecture: info.Architecture,
      os: info.Os,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ image, error: message }, 'Failed to inspect image')
    throw new DockerError(`Failed to inspect image '${image}': ${message}`)
  }
}

/**
 * Tag an image
 * @param image Source image name or ID
 * @param repo Repository name for the new tag
 * @param tag Tag name (default: 'latest')
 */
export async function tagImage(image: string, repo: string, tag = 'latest'): Promise<void> {
  const docker = getDockerClient()

  logger.info({ image, repo, tag }, 'Tagging image')

  try {
    const dockerImage = docker.getImage(image)
    await dockerImage.tag({ repo, tag })
    logger.info({ image, newTag: `${repo}:${tag}` }, 'Image tagged')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ image, repo, tag, error: message }, 'Failed to tag image')
    throw new DockerError(`Failed to tag image '${image}' as '${repo}:${tag}': ${message}`)
  }
}

/**
 * Prune unused images
 * @param all Remove all unused images, not just dangling ones
 * @returns Space reclaimed in bytes
 */
export async function pruneImages(all = false): Promise<number> {
  const docker = getDockerClient()

  logger.info({ all }, 'Pruning images')

  try {
    const result = await docker.pruneImages({
      filters: all ? {} : { dangling: ['true'] },
    })

    const spaceReclaimed = result.SpaceReclaimed || 0
    logger.info(
      { imagesDeleted: result.ImagesDeleted?.length || 0, spaceReclaimed },
      'Images pruned',
    )

    return spaceReclaimed
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ error: message }, 'Failed to prune images')
    throw new DockerError(`Failed to prune images: ${message}`)
  }
}
