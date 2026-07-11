/**
 * Connection environment variable resolution for Mizu.
 * Resolves service connections into env vars whose hosts are `.mizu` DNS
 * names — the local domain served by `container system dns`, resolvable from
 * both the host and other containers, stable across restarts.
 */

import { createLogger } from '@mizu/logger'
import {
  type DatabaseCredentials,
  type DatabaseType,
  databaseTable,
  serviceConnectionTable,
  serviceTable,
} from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { decrypt } from '../shared/crypto'
import { MIZU_DNS_DOMAIN } from './constants'
import { sanitizeName } from './networks'

const logger = createLogger('runtime:env-resolution')

const DEFAULT_PORTS: Record<string, number> = {
  postgres: 5432,
  mysql: 3306,
  mariadb: 3306,
  mongodb: 27017,
  redis: 6379,
}

/** DNS host for a deployed container */
export function containerDnsHost(projectSlug: string, entityName: string): string {
  return `mizu-${sanitizeName(projectSlug)}-${sanitizeName(entityName)}.${MIZU_DNS_DOMAIN}`
}

/**
 * Build a connection string for a database using its DNS name as the host.
 */
function buildConnectionString(
  type: DatabaseType,
  host: string,
  port: number,
  credentials: DatabaseCredentials,
): string {
  const { username, password, database: dbName } = credentials

  switch (type) {
    case 'postgres':
      return `postgresql://${username}:${password}@${host}:${port}/${dbName}`
    case 'mysql':
    case 'mariadb':
      return `mysql://${username}:${password}@${host}:${port}/${dbName}`
    case 'mongodb':
      return `mongodb://${username}:${password}@${host}:${port}/${dbName}`
    case 'redis':
      return password ? `redis://:${password}@${host}:${port}` : `redis://${host}:${port}`
  }
}

/**
 * Resolve all outgoing connection env vars for a service.
 * Looks up serviceConnectionTable for connections FROM this service and
 * builds env vars using `.mizu` DNS names as hosts.
 *
 * @returns Record of env var name → value
 */
export async function resolveConnectionEnvVars(
  serviceId: string,
  projectSlug: string,
): Promise<Record<string, string>> {
  const envVars: Record<string, string> = {}

  const connections = await db
    .select()
    .from(serviceConnectionTable)
    .where(eq(serviceConnectionTable.fromServiceId, serviceId))

  for (const conn of connections) {
    if (!conn.envVarName) continue

    try {
      if (conn.targetType === 'database' && conn.toDatabaseId) {
        const [database] = await db
          .select()
          .from(databaseTable)
          .where(eq(databaseTable.id, conn.toDatabaseId))

        if (!database) {
          logger.warn(
            { connectionId: conn.id, databaseId: conn.toDatabaseId },
            'Target database not found',
          )
          continue
        }

        if (!database.credentials) {
          logger.warn(
            { connectionId: conn.id, databaseId: conn.toDatabaseId },
            'Database has no credentials',
          )
          continue
        }

        const credentials: DatabaseCredentials = JSON.parse(decrypt(database.credentials))
        const host = containerDnsHost(projectSlug, database.name)
        const port = database.port || DEFAULT_PORTS[database.type] || 5432

        envVars[conn.envVarName] = buildConnectionString(
          database.type as DatabaseType,
          host,
          port,
          credentials,
        )
      } else if (conn.targetType === 'service' && conn.toServiceId) {
        const [targetService] = await db
          .select()
          .from(serviceTable)
          .where(eq(serviceTable.id, conn.toServiceId))

        if (!targetService) {
          logger.warn(
            { connectionId: conn.id, serviceId: conn.toServiceId },
            'Target service not found',
          )
          continue
        }

        // For service-to-service connections, provide the DNS host
        envVars[conn.envVarName] = containerDnsHost(projectSlug, targetService.name)
      }
    } catch (error) {
      logger.error(
        { connectionId: conn.id, envVarName: conn.envVarName, error },
        'Failed to resolve connection env var',
      )
    }
  }

  return envVars
}
