/**
 * Connection environment variable resolution for Mizu.
 *
 * Apple `container` (as of 1.1.0) has no container-name DNS — verified
 * empirically — so connections are wired by the target container's CURRENT
 * IP, resolved at deploy time. The supervisor re-deploys dependents when a
 * target container comes back with a new IP.
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
import { getContainerStatus } from './containers'
import { sanitizeName } from './networks'

const logger = createLogger('runtime:env-resolution')

const DEFAULT_PORTS: Record<string, number> = {
  postgres: 5432,
  mysql: 3306,
  mariadb: 3306,
  mongodb: 27017,
  redis: 6379,
}

/** Deterministic container name for a deployed entity within a deploy namespace */
export function entityContainerName(namespace: string, entityName: string): string {
  return `mizu-${sanitizeName(namespace)}-${sanitizeName(entityName)}`
}

/** Current IP of a container, or null when it isn't running */
export async function resolveContainerIp(containerName: string): Promise<string | null> {
  try {
    const status = await getContainerStatus(containerName)
    return status.running ? status.ipv4Address : null
  } catch {
    return null
  }
}

/**
 * Build a connection string for a database using its container IP as host.
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
 * Targets must be running (deploy databases first); unresolvable targets are
 * skipped with a warning so the deploy still proceeds.
 *
 * @returns Record of env var name → value
 */
export async function resolveConnectionEnvVars(
  serviceId: string,
  namespace: string,
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

        const containerName = entityContainerName(namespace, database.name)
        const host = await resolveContainerIp(database.containerId ?? containerName)
        if (!host) {
          logger.warn(
            { connectionId: conn.id, databaseId: conn.toDatabaseId },
            'Target database is not running — env var skipped (deploy it first)',
          )
          continue
        }

        const credentials: DatabaseCredentials = JSON.parse(decrypt(database.credentials))
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

        const containerName = entityContainerName(namespace, targetService.name)
        const host = await resolveContainerIp(targetService.containerId ?? containerName)
        if (!host) {
          logger.warn(
            { connectionId: conn.id, serviceId: conn.toServiceId },
            'Target service is not running — env var skipped (deploy it first)',
          )
          continue
        }

        envVars[conn.envVarName] = host
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
