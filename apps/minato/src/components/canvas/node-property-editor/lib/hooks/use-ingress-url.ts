import { useQuery } from '@tanstack/react-query'
import { instanceSettingsQueries } from '@/shared/api'
import { sanitizeResourceName } from '../utils'

/**
 * The public URL a running service is served on through the mizu ingress
 * (caddy): http://{service}.{project}.{baseDomain}. Null while the service
 * has no ports or isn't running.
 */
export function useIngressUrl(
  serviceName: string,
  projectSlug: string,
  exposed: boolean,
): string | null {
  const { data: settings } = useQuery(instanceSettingsQueries.get())
  if (!exposed || !projectSlug) return null
  const baseDomain = settings?.domain || 'localhost'
  return `http://${sanitizeResourceName(serviceName)}.${sanitizeResourceName(projectSlug)}.${baseDomain}`
}
