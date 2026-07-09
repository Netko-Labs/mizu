import type { DatabaseCredentials } from '@mizu/nagare-domain'

export function parseDatabaseCredentials(credentials: string | null): DatabaseCredentials | null {
  if (!credentials) return null
  try {
    return JSON.parse(credentials) as DatabaseCredentials
  } catch {
    return null
  }
}
