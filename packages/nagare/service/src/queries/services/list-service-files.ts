import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import type { ServiceFileEntry, ServiceFileListing } from '@mizu/nagare-domain'
import { resolveServiceFilePath } from '../../shared/service-files'

/**
 * List a directory inside the service's host file area (config files +
 * persistent volume dirs). A missing area lists as empty — the service simply
 * has no files yet.
 */
export const listServiceFiles = async (
  serviceId: string,
  relPath: string,
): Promise<ServiceFileListing> => {
  const { absolute, relative } = await resolveServiceFilePath(serviceId, relPath)

  let names: string[] = []
  try {
    names = await readdir(absolute)
  } catch {
    return { path: relative, entries: [] }
  }

  const entries: ServiceFileEntry[] = []
  for (const name of names.sort()) {
    try {
      const info = await stat(join(absolute, name))
      entries.push({
        name,
        type: info.isDirectory() ? 'dir' : 'file',
        size: info.size,
        modifiedAt: info.mtime.toISOString(),
      })
    } catch {
      // Entry vanished between readdir and stat — skip it.
    }
  }
  // Directories first, then files, both alphabetical.
  entries.sort((a, b) =>
    a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1,
  )
  return { path: relative, entries }
}
