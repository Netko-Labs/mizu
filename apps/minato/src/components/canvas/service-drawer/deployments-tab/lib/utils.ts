export { formatRelativeTime } from '@/components/canvas/lib'

/** "eceasy/cli-proxy-api:latest" from a deployment's sourceConfig snapshot. */
export function deploymentImageRef(sourceConfig: unknown): string {
  const config = (sourceConfig ?? {}) as { image?: string; tag?: string }
  if (!config.image) return 'unknown image'
  return config.tag ? `${config.image}:${config.tag}` : config.image
}
