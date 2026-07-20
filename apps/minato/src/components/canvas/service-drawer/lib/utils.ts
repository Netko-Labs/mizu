import type { DatabaseCredentials } from '@mizu/nagare-domain'

export function parseDatabaseCredentials(credentials: string | null): DatabaseCredentials | null {
  if (!credentials) return null
  try {
    return JSON.parse(credentials) as DatabaseCredentials
  } catch {
    return null
  }
}

/** Compact elapsed time without the "ago" suffix: "5m", "2h", "3d". */
export function formatCompactDuration(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

/** Mirror of nagare's runtime sanitizeName — container/hostname-safe slug */
export function sanitizeResourceName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '-')
    .replace(/^[^a-z0-9]+/, '')
    .replace(/-+/g, '-')
}
