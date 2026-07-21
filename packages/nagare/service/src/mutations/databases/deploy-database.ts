import { createLogger } from '@mizu/logger'
import {
  type DatabaseCredentials,
  type DatabaseType,
  databaseTable,
  projectTable,
} from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { getDeployContext } from '../../queries/environments'
import {
  createContainer,
  createVolume,
  ensureDeployNetwork,
  entityContainerName,
  execInContainer,
  MIZU_LABELS,
  pullImage,
  removeContainer,
  startContainer,
  stopContainer,
} from '../../runtime'
import { decrypt } from '../../shared/crypto'

const logger = createLogger('service:deploy-database')

const READY_ATTEMPTS = 30
const READY_INTERVAL_MS = 2_000

const DATABASE_IMAGES: Record<DatabaseType, string> = {
  postgres: 'postgres',
  mysql: 'mysql',
  redis: 'redis',
  mongodb: 'mongo',
  mariadb: 'mariadb',
}

export const DEFAULT_PORTS: Record<DatabaseType, number> = {
  postgres: 5432,
  mysql: 3306,
  redis: 6379,
  mongodb: 27017,
  mariadb: 3306,
}

/**
 * Where each database keeps its data, adjusted for Apple container volumes:
 * named volumes are ext4 disks whose root contains lost+found, so engines
 * that refuse a non-empty data directory get pointed at a subdirectory.
 */
const DATA_PATHS: Record<DatabaseType, string> = {
  postgres: '/var/lib/postgresql/data',
  mysql: '/var/lib/mysql',
  redis: '/data',
  mongodb: '/data/db',
  mariadb: '/var/lib/mysql',
}

function buildDataDirConfig(type: DatabaseType): { env: Record<string, string>; args: string[] } {
  switch (type) {
    case 'postgres':
      return { env: { PGDATA: '/var/lib/postgresql/data/pgdata' }, args: [] }
    case 'mysql':
    case 'mariadb':
      return { env: {}, args: ['--datadir=/var/lib/mysql/data'] }
    // redis tolerates lost+found; mongodb keeps the default dbpath (its
    // entrypoint owns the mount) — revisit if init complains.
    default:
      return { env: {}, args: [] }
  }
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

/** Exec-based readiness probe (replaces docker healthchecks). */
function buildReadinessProbe(type: DatabaseType, credentials: DatabaseCredentials): string[] {
  switch (type) {
    case 'postgres':
      return ['pg_isready', '-U', credentials.username]
    case 'mysql':
      return ['mysqladmin', 'ping', '-h', '127.0.0.1', '--silent']
    case 'mariadb':
      return ['healthcheck.sh', '--connect', '--innodb_initialized']
    case 'mongodb':
      return ['mongosh', '--quiet', '--eval', "db.adminCommand('ping')"]
    case 'redis':
      return credentials.password
        ? ['redis-cli', '-a', credentials.password, 'ping']
        : ['redis-cli', 'ping']
  }
}

async function waitForReady(
  containerId: string,
  probe: string[],
  databaseId: string,
): Promise<void> {
  for (let attempt = 0; attempt < READY_ATTEMPTS; attempt++) {
    if (await execInContainer(containerId, probe)) {
      logger.info({ databaseId, containerId, attempt }, 'Database ready')
      return
    }
    await Bun.sleep(READY_INTERVAL_MS)
  }
  throw new Error(
    `Database did not become ready within ${(READY_ATTEMPTS * READY_INTERVAL_MS) / 1000}s`,
  )
}

/**
 * Deploys a database by creating and starting its container, then waiting
 * for it to accept connections.
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

  const deployCtx = await getDeployContext(database.environmentId)
  if (!deployCtx) {
    throw new Error('Environment not found')
  }
  const { namespace } = deployCtx

  const dbType = database.type as DatabaseType

  try {
    // Cleanup stale container if exists
    if (database.containerId) {
      await stopContainer(database.containerId).catch(() => {})
      await removeContainer(database.containerId, true).catch(() => {})
    }

    // 1. Set status → starting
    await db
      .update(databaseTable)
      .set({ status: 'starting' })
      .where(eq(databaseTable.id, databaseId))

    // 2. Pull image
    const version = database.version || 'latest'
    await pullImage(DATABASE_IMAGES[dbType], version)

    // 3. Ensure the environment's network
    const networkName = await ensureDeployNetwork(namespace)

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

    // 5. Build env vars + data-dir handling
    const dataDir = buildDataDirConfig(dbType)
    const env = { ...buildEnvVars(dbType, credentials), ...dataDir.env }

    // 6. Build container name + volume
    const containerName = entityContainerName(namespace, database.name)
    const volumeName = `${containerName}-data`
    await createVolume(volumeName)

    // Guard against name collisions from a lost containerId (best-effort)
    await removeContainer(containerName, true).catch(() => {})

    // 7. Build port mapping
    const hostPort = database.port || DEFAULT_PORTS[dbType]
    const containerPort = DEFAULT_PORTS[dbType]

    // Redis with password needs special CMD; mysql/mariadb take datadir args
    const cmd =
      dbType === 'redis' && credentials.password
        ? ['redis-server', '--requirepass', credentials.password]
        : dataDir.args.length > 0
          ? dataDir.args
          : undefined

    // 8. Create container
    const containerId = await createContainer({
      name: containerName,
      image: `${DATABASE_IMAGES[dbType]}:${version}`,
      env,
      cmd,
      ports: [{ containerPort, hostPort, protocol: 'tcp' }],
      volumes: [{ source: volumeName, target: DATA_PATHS[dbType] }],
      network: networkName,
      labels: {
        [MIZU_LABELS.managed]: 'true',
        [MIZU_LABELS.project]: project.id,
        [MIZU_LABELS.entity]: databaseId,
        [MIZU_LABELS.entityType]: 'database',
      },
    })

    // 9. Start container + wait until it accepts connections
    await startContainer(containerId)
    await waitForReady(containerId, buildReadinessProbe(dbType, credentials), databaseId)

    // 10. Update DB
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
