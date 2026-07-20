import type { ExecResult, ServiceFileContent, ServiceFileListing } from '@mizu/nagare-domain'
import { queryOptions } from '@tanstack/react-query'
import { nagare } from '@/integrations/nagare'
import { unwrap } from '../utils'

export const fileKeys = {
  all: ['files'] as const,
  list: (serviceId: string, path: string) => ['files', 'list', serviceId, path] as const,
  content: (serviceId: string, path: string) => ['files', 'content', serviceId, path] as const,
}

export const fileQueries = {
  /** Directory listing inside the service's host file area. */
  list: (serviceId: string, path: string) =>
    queryOptions({
      queryKey: fileKeys.list(serviceId, path),
      queryFn: async () =>
        (await unwrap(
          nagare.services({ serviceId }).files.get({ query: { path } }),
        )) as unknown as ServiceFileListing,
    }),
  /** File content for the in-drawer editor (size-capped server-side). */
  content: (serviceId: string, path: string) =>
    queryOptions({
      queryKey: fileKeys.content(serviceId, path),
      queryFn: async () =>
        (await unwrap(
          nagare.services({ serviceId }).files.content.get({ query: { path } }),
        )) as unknown as ServiceFileContent,
    }),
}

export const writeServiceFile = async ({
  serviceId,
  path,
  content,
}: {
  serviceId: string
  path: string
  content: string
}) =>
  (await unwrap(
    nagare.services({ serviceId }).files.content.put({ path, content }),
  )) as unknown as { path: string }

/** One-shot console command in the running container. */
export const execServiceCommand = async ({
  serviceId,
  command,
}: {
  serviceId: string
  command: string
}) => (await unwrap(nagare.services({ serviceId }).exec.post({ command }))) as unknown as ExecResult
