import type { Volume } from '@mizu/minato-domain'
import type { ComposeVolume } from '../types'

/**
 * Transform a Mizu volume to a Docker Compose volume definition.
 */
export function transformVolume(volume: Volume): ComposeVolume {
  const composeVolume: ComposeVolume = {
    driver: 'local',
  }

  // If there's an external Docker volume name, reference it
  if (volume.dockerVolumeName && volume.dockerVolumeName !== volume.name) {
    composeVolume.name = volume.dockerVolumeName
  }

  return composeVolume
}

/**
 * Transform multiple volumes to Docker Compose volume definitions.
 */
export function transformVolumes(volumes: Volume[]): Record<string, ComposeVolume> {
  const result: Record<string, ComposeVolume> = {}

  for (const volume of volumes) {
    const name = volume.dockerVolumeName || volume.name
    result[name] = transformVolume(volume)
  }

  return result
}
