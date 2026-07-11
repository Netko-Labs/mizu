/**
 * Image operations on Apple's `container` CLI.
 */

import { createLogger } from '@mizu/logger'
import { runtimeCli } from './cli'
import { PULL_TIMEOUT_MS } from './constants'

const logger = createLogger('runtime:images')

/**
 * Qualify a short image ref the way docker does implicitly:
 * `nginx` → docker.io/library/nginx, `org/app` → docker.io/org/app,
 * refs with a registry host pass through untouched.
 */
export function qualifyImageRef(image: string): string {
  const [ref, tag] = splitTag(image)
  const segments = ref.split('/')
  let qualified: string
  if (segments.length === 1) {
    qualified = `docker.io/library/${ref}`
  } else if (segments[0]?.includes('.') || segments[0]?.includes(':')) {
    qualified = ref
  } else {
    qualified = `docker.io/${ref}`
  }
  return tag ? `${qualified}:${tag}` : qualified
}

function splitTag(image: string): [string, string | null] {
  const lastColon = image.lastIndexOf(':')
  // A colon after the last slash is a tag separator (not a registry port)
  if (lastColon > image.lastIndexOf('/')) {
    return [image.slice(0, lastColon), image.slice(lastColon + 1)]
  }
  return [image, null]
}

/**
 * Pull an image. Progress output from the CLI is TTY-oriented and not
 * parseable — we log start/finish only.
 */
export async function pullImage(image: string, tag = 'latest'): Promise<void> {
  const ref = qualifyImageRef(image.includes(':') ? image : `${image}:${tag}`)
  logger.info({ ref }, 'Pulling image')
  await runtimeCli(['image', 'pull', ref], { timeoutMs: PULL_TIMEOUT_MS })
  logger.info({ ref }, 'Image pulled')
}
