import type { DatabaseCredentials } from '@mizu/nagare-domain'

export function parseDatabaseCredentials(credentials: string | null): DatabaseCredentials | null {
  if (!credentials) return null
  try {
    return JSON.parse(credentials) as DatabaseCredentials
  } catch {
    return null
  }
}

/** Mirror of nagare's runtime sanitizeName — container/hostname-safe slug */
export function sanitizeResourceName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '-')
    .replace(/^[^a-z0-9]+/, '')
    .replace(/-+/g, '-')
}
