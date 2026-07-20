import { readFile, stat } from 'node:fs/promises'
import type { ServiceFileContent } from '@mizu/nagare-domain'
import { NotFoundError } from '../../shared/authz'
import { resolveServiceFilePath } from '../../shared/service-files'

/** Max bytes served to the in-drawer editor. */
const READ_LIMIT = 512 * 1024

/** Read a text file from the service's host file area (size-capped). */
export const readServiceFile = async (
  serviceId: string,
  relPath: string,
): Promise<ServiceFileContent> => {
  const { absolute, relative } = await resolveServiceFilePath(serviceId, relPath)

  let info: Awaited<ReturnType<typeof stat>>
  try {
    info = await stat(absolute)
  } catch {
    throw new NotFoundError('File not found')
  }
  if (info.isDirectory()) throw new NotFoundError('Path is a directory')

  const buffer = await readFile(absolute)
  const truncated = buffer.length > READ_LIMIT
  return {
    path: relative,
    content: buffer.subarray(0, READ_LIMIT).toString('utf8'),
    truncated,
  }
}
