import { writeFileAtomic } from '../../filesystem'
import { resolveServiceFilePath } from '../../shared/service-files'

/**
 * Write a text file inside the service's host file area. Bind-mounted paths
 * (template config files, persistent volume dirs) reflect inside the running
 * container immediately; other files apply on next deploy.
 */
export const writeServiceFile = async (
  serviceId: string,
  relPath: string,
  content: string,
): Promise<{ path: string }> => {
  const { absolute, relative } = await resolveServiceFilePath(serviceId, relPath)
  await writeFileAtomic(absolute, content)
  return { path: relative }
}
