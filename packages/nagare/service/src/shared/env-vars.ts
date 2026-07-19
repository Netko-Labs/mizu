import { createLogger } from '@mizu/logger'
import { decrypt } from './crypto'

const logger = createLogger('service:env-vars')

/**
 * Parse a service's stored user env vars: decrypt-then-JSON, falling back to
 * plain JSON for legacy rows, `{}` when unset/unreadable. The single source of
 * truth for reading `service.envVars` (deploy + editor share it).
 */
export function parseUserEnvVars(encrypted: string | null): Record<string, string> {
  if (!encrypted) return {}
  try {
    return JSON.parse(decrypt(encrypted))
  } catch {
    logger.warn('Failed to decrypt env vars, trying as plain JSON')
    try {
      return JSON.parse(encrypted)
    } catch {
      logger.warn('Failed to parse env vars')
      return {}
    }
  }
}
