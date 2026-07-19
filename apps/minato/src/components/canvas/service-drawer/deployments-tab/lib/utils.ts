/** Compact relative time: "just now", "4m ago", "2h ago", "3d ago". */
export function formatRelativeTime(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

/** "eceasy/cli-proxy-api:latest" from a deployment's sourceConfig snapshot. */
export function deploymentImageRef(sourceConfig: unknown): string {
  const config = (sourceConfig ?? {}) as { image?: string; tag?: string }
  if (!config.image) return 'unknown image'
  return config.tag ? `${config.image}:${config.tag}` : config.image
}
