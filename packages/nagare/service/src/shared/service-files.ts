import { realpath } from 'node:fs/promises'
import { join, normalize, resolve, sep } from 'node:path'
import { getMizuHome } from '../filesystem'
import { NotFoundError } from './authz'

/** The service's host-backed file area (config files + persistent volumes). */
export function serviceFilesRoot(serviceId: string): string {
  return join(getMizuHome(), 'services', serviceId)
}

/**
 * Resolve a user-supplied relative path inside the service's file area,
 * rejecting traversal ('..', absolute paths) and symlink escapes. Returns the
 * absolute path plus the normalized relative form for display.
 */
export async function resolveServiceFilePath(
  serviceId: string,
  relPath: string,
): Promise<{ absolute: string; relative: string }> {
  const root = resolve(serviceFilesRoot(serviceId))
  const cleaned = normalize(relPath).replace(/^([/\\])+/, '')
  const absolute = resolve(root, cleaned)
  if (absolute !== root && !absolute.startsWith(root + sep)) {
    throw new NotFoundError('Path outside the service file area')
  }

  // Symlink escape guard: the closest existing ancestor must stay in-root.
  let probe = absolute
  for (;;) {
    try {
      const real = await realpath(probe)
      const realRoot = await realpath(root).catch(() => root)
      if (real !== realRoot && !real.startsWith(realRoot + sep)) {
        throw new NotFoundError('Path outside the service file area')
      }
      break
    } catch (error) {
      if (error instanceof NotFoundError) throw error
      const parent = resolve(probe, '..')
      if (parent === probe) break
      probe = parent
    }
  }

  const relative = absolute === root ? '' : absolute.slice(root.length + 1)
  return { absolute, relative }
}
