/**
 * Volume operations on Apple's `container` CLI.
 * Volumes are ext4 disks inside the VM — the mount root contains lost+found,
 * so data dirs must live in a subdirectory (e.g. postgres PGDATA).
 */

import { createLogger } from '@mizu/logger'
import { runtimeCli } from './cli'
import { RuntimeError } from './types'

const logger = createLogger('runtime:volumes')

/**
 * Create a named volume (no-op when it already exists)
 */
export async function createVolume(name: string): Promise<string> {
  try {
    await runtimeCli(['volume', 'create', name])
    logger.info({ name }, 'Created volume')
  } catch (error) {
    if (!(error instanceof RuntimeError && error.code === 'ALREADY_EXISTS')) {
      throw error
    }
  }
  return name
}
