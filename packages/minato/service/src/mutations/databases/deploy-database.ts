import { createLogger } from '@mizu/logger'
import {
  type DatabaseCredentials,
  type DatabaseType,
  databaseTable,
  projectTable,
} from '@mizu/minato-domain'
import { db } from '@mizu/minato-repository'
import { eq } from 'drizzle-orm'
import {
  createContainer,
  removeContainer,
  startContainer,
  stopContainer,
} from '../../docker/containers'
import { pullImage } from '../../docker/images'
import { ensureProjectNetwork, sanitizeDockerName } from '../../docker/project-network'
import { createVolume } from '../../docker/volumes'
import { decrypt } from '../../utils/crypto'

const logger = createLogger('service:deploy-database')

const DATABASE_IMAGES: Record<DatabaseType, string> = {
  postgres: 'postgres',
  mysql: 'mysql',
  redis: 'redis',
  mongodb: 'mongo',
  mariadb: 'mariadb',
}

const DEFAULT_PORTS: Record<DatabaseType, number> = {
  postgres: 5432,
  mysql: 3306,
  redis: 6379,
  mongodb: 27017,
  mariadb: 3306,
}

const DATA_PATHS: Record<DatabaseType, string> = {
  postgres: '/var/lib/postgresql/data',
  mysql: '/var/lib/mysql',
  redis: '/data',
  mongodb: '/data/db',
  mariadb: '/var/lib/mysql',
}

function buildEnvVars(
  type: DatabaseType,
  credentials: DatabaseCredentials,
): Record<string, string> {
  switch (type) {
    case 'postgres':
      return {
        POSTGRES_USER: credentials.username,
        POSTGRES_PASSWORD: credentials.password,
        POSTGRES_DB: credentials.database,
      }
    case 'mysql':
      return {
        MYSQL_USER: credentials.username,
        MYSQL_PASSWORD: credentials.password,
        MYSQL_DATABASE: credentials.database,
        MYSQL_ROOT_PASSWORD: credentials.rootPassword || credentials.password,
      }
    case 'mariadb':
      return {
        MARIADB_USER: credentials.username,
        MARIADB_PASSWORD: credentials.password,
        MARIADB_DATABASE: credentials.database,
        MARIADB_ROOT_PASSWORD: credentials.rootPassword || credentials.password,
      }
    case 'mongodb':
      return {
        MONGO_INITDB_ROOT_USERNAME: credentials.username,
        MONGO_INITDB_ROOT_PASSWORD: credentials.password,
        MONGO_INITDB_DATABASE: credentials.database,
      }
    case 'redis':
      return credentials.password ? { REDIS_PASSWORD: credentials.password } : {}
  }
}

function buildHealthCheck(type: DatabaseType) {
  switch (type) {
    case 'postgres':
      return {
        test: ['CMD-SHELL', 'pg_isready -U postgres'],
        interval: 10,
        timeout: 5,
        retries: 5,
        startPeriod: 30,
      }
    case 'mysql':
      return {
        test: ['CMD', 'mysqladmin', 'ping', '-h', 'localhost'],
        interval: 10,
        timeout: 5,
        retries: 5,
        startPeriod: 30,
      }
    case 'mariadb':
      return {
        test: ['CMD', 'healthcheck.sh', '--connect', '--innodb_initialized'],
        interval: 10,
        timeout: 5,
        retries: 5,
        startPeriod: 30,
      }
    case 'mongodb':
      return {
        test: ['CMD', 'mongosh', '--eval', "db.adminCommand('ping')"],
        interval: 10,
        timeout: 5,
        retries: 5,
        startPeriod: 30,
      }
    case 'redis':
      return {
        test: ['CMD', 'redis-cli', 'ping'],
        interval: 10,
        timeout: 5,
        retries: 5,
        startPeriod: 10,
      }
  }
}

/**
 * Deploys a database by creating and starting its Docker container.
 */
export const deployDatabase = async (databaseId: string): Promise<void> => {
  const [database] = await db.select().from(databaseTable).where(eq(databaseTable.id, databaseId))

  if (!database) {
    throw new Error('Database not found')
  }

  const [project] = await db
    .select()
    .from(projectTable)
    .where(eq(projectTable.id, database.projectId))

  if (!project) {
    throw new Error('Parent project not found')
  }

  const dbType = database.type as DatabaseType

  try {
    // Cleanup stale container if exists
    if (database.containerId) {
      try {
        await stopContainer(database.containerId)
      } catch {
        // Container may already be stopped
      }
      try {
        await removeContainer(database.containerId, true)
      } catch {
        // Container may already be removed
      }
    }

    // 1. Set status → starting
    await db
      .update(databaseTable)
      .set({ status: 'starting' })
      .where(eq(databaseTable.id, databaseId))

    // 2. Pull image
    const version = database.version || 'latest'
    await pullImage(DATABASE_IMAGES[dbType], version)

    // 3. Ensure project network
    const networkName = `mizu-${sanitizeDockerName(project.slug)}`
    await ensureProjectNetwork(project.id, project.slug)

    // 4. Parse credentials
    let credentials: DatabaseCredentials = {
      username: 'mizu',
      password: 'mizu',
      database: 'mizu',
    }
    if (database.credentials) {
      try {
        credentials = JSON.parse(decrypt(database.credentials))
      } catch {
        logger.warn({ databaseId }, 'Failed to decrypt credentials, using defaults')
      }
    }

    // 5. Build env vars
    const env = buildEnvVars(dbType, credentials)

    // 6. Build container name + volume
    const containerName = `mizu-${sanitizeDockerName(project.slug)}-${sanitizeDockerName(database.name)}`
    const volumeName = `${containerName}-data`
    await createVolume(volumeName)

    // 7. Build health check
    const healthCheck = buildHealthCheck(dbType)

    // 8. Build port mapping
    const hostPort = database.port || DEFAULT_PORTS[dbType]
    const containerPort = DEFAULT_PORTS[dbType]

    // Redis with password needs special CMD
    const cmd =
      dbType === 'redis' && credentials.password
        ? ['redis-server', '--requirepass', credentials.password]
        : undefined

    // 9. Create container
    const containerId = await createContainer({
      name: containerName,
      image: `${DATABASE_IMAGES[dbType]}:${version}`,
      env,
      cmd,
      ports: [{ containerPort, hostPort, protocol: 'tcp' }],
      volumes: [{ source: volumeName, target: DATA_PATHS[dbType] }],
      network: networkName,
      restartPolicy: 'unless-stopped',
      healthCheck,
      labels: {
        'mizu.managed': 'true',
        'mizu.project': project.id,
        'mizu.entity': databaseId,
        'mizu.entity.type': 'database',
      },
    })

    // 10. Start container
    await startContainer(containerId)

    // 11. Update DB
    await db
      .update(databaseTable)
      .set({ status: 'running', containerId })
      .where(eq(databaseTable.id, databaseId))

    logger.info(
      { databaseId, containerId, containerName, dbType },
      'Database deployed successfully',
    )
  } catch (error) {
    await db.update(databaseTable).set({ status: 'error' }).where(eq(databaseTable.id, databaseId))

    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error({ databaseId, error: message }, 'Database deployment failed')
    throw error
  }
}
