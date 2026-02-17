import type { Database, ServiceConnection, Volume } from '@mizu/minato-domain'
import type { ComposeService } from '../types'

/**
 * Database image configurations by type and version.
 */
const DATABASE_IMAGES: Record<string, Record<string, string>> = {
  postgres: {
    default: 'postgres:16-alpine',
    '16': 'postgres:16-alpine',
    '15': 'postgres:15-alpine',
    '14': 'postgres:14-alpine',
  },
  mysql: {
    default: 'mysql:8',
    '8': 'mysql:8',
    '5.7': 'mysql:5.7',
  },
  redis: {
    default: 'redis:7-alpine',
    '7': 'redis:7-alpine',
    '6': 'redis:6-alpine',
  },
  mongodb: {
    default: 'mongo:7',
    '7': 'mongo:7',
    '6': 'mongo:6',
  },
  mariadb: {
    default: 'mariadb:11',
    '11': 'mariadb:11',
    '10': 'mariadb:10',
  },
}

/**
 * Default ports by database type.
 */
const DATABASE_PORTS: Record<string, number> = {
  postgres: 5432,
  mysql: 3306,
  redis: 6379,
  mongodb: 27017,
  mariadb: 3306,
}

/**
 * Health check configurations by database type.
 */
const DATABASE_HEALTHCHECKS: Record<string, ComposeService['healthcheck']> = {
  postgres: {
    test: ['CMD-SHELL', 'pg_isready -U $POSTGRES_USER -d $POSTGRES_DB'],
    interval: '10s',
    timeout: '5s',
    retries: 5,
  },
  mysql: {
    test: ['CMD', 'mysqladmin', 'ping', '-h', 'localhost'],
    interval: '10s',
    timeout: '5s',
    retries: 5,
  },
  redis: {
    test: ['CMD', 'redis-cli', 'ping'],
    interval: '10s',
    timeout: '5s',
    retries: 5,
  },
  mongodb: {
    test: ['CMD', 'mongosh', '--eval', "db.adminCommand('ping')"],
    interval: '10s',
    timeout: '5s',
    retries: 5,
  },
  mariadb: {
    test: ['CMD', 'healthcheck.sh', '--connect', '--innodb_initialized'],
    interval: '10s',
    timeout: '5s',
    retries: 5,
  },
}

/**
 * Transform a Mizu database to a Docker Compose service definition.
 */
export function transformDatabase(
  database: Database,
  connections: ServiceConnection[],
  _volumes: Volume[],
): ComposeService {
  const composeService: ComposeService = {}

  // Get the appropriate image
  const typeImages = DATABASE_IMAGES[database.type] || {}
  composeService.image = typeImages[database.version || 'default'] || typeImages.default

  // Container name (sanitize: lowercase, replace spaces/special chars with dashes)
  const safeName = database.name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
  composeService.container_name = `mizu-${safeName}`

  // Port mapping
  const defaultPort = DATABASE_PORTS[database.type]
  const hostPort = database.port || defaultPort
  if (defaultPort) {
    composeService.ports = [`${hostPort}:${defaultPort}`]
  }

  // Environment variables from credentials
  const environment: Record<string, string> = {}

  if (database.credentials) {
    try {
      const creds = JSON.parse(database.credentials) as Record<string, string>

      // Map credentials to database-specific env vars
      switch (database.type) {
        case 'postgres':
          if (creds.username) environment.POSTGRES_USER = creds.username
          if (creds.password) environment.POSTGRES_PASSWORD = creds.password
          if (creds.database) environment.POSTGRES_DB = creds.database
          break
        case 'mysql':
          if (creds.username) environment.MYSQL_USER = creds.username
          if (creds.password) environment.MYSQL_PASSWORD = creds.password
          if (creds.database) environment.MYSQL_DATABASE = creds.database
          if (creds.rootPassword) environment.MYSQL_ROOT_PASSWORD = creds.rootPassword
          break
        case 'mongodb':
          if (creds.username) environment.MONGO_INITDB_ROOT_USERNAME = creds.username
          if (creds.password) environment.MONGO_INITDB_ROOT_PASSWORD = creds.password
          if (creds.database) environment.MONGO_INITDB_DATABASE = creds.database
          break
        case 'mariadb':
          if (creds.username) environment.MARIADB_USER = creds.username
          if (creds.password) environment.MARIADB_PASSWORD = creds.password
          if (creds.database) environment.MARIADB_DATABASE = creds.database
          if (creds.rootPassword) environment.MARIADB_ROOT_PASSWORD = creds.rootPassword
          break
        // Redis typically doesn't need env vars unless using AUTH
      }
    } catch {
      // Invalid credentials JSON
    }
  }

  if (Object.keys(environment).length > 0) {
    composeService.environment = environment
  }

  // Data volume for persistence
  const volumeName = `mizu-${safeName}-data`
  const dataPath = getDataPath(database.type)
  if (dataPath) {
    composeService.volumes = [`${volumeName}:${dataPath}`]
  }

  // Health check
  const healthcheck = DATABASE_HEALTHCHECKS[database.type]
  if (healthcheck) {
    composeService.healthcheck = healthcheck
  }

  // Networks
  const networkConnections = connections.filter(
    (c) => c.toDatabaseId === database.id && c.targetType === 'network' && c.toNetworkId,
  )
  if (networkConnections.length > 0) {
    composeService.networks = networkConnections
      .map((c) => c.toNetworkId)
      .filter((id): id is string => id != null)
  }

  // Restart policy
  composeService.restart = 'unless-stopped'

  return composeService
}

/**
 * Get the data directory path for a database type.
 */
function getDataPath(type: string): string | undefined {
  const paths: Record<string, string> = {
    postgres: '/var/lib/postgresql/data',
    mysql: '/var/lib/mysql',
    redis: '/data',
    mongodb: '/data/db',
    mariadb: '/var/lib/mysql',
  }
  return paths[type]
}

/**
 * Get volume definitions for databases.
 */
export function getDatabaseVolumes(databases: Database[]): Record<string, { driver: string }> {
  const vols: Record<string, { driver: string }> = {}

  for (const db of databases) {
    const safeName = db.name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
    const volumeName = `mizu-${safeName}-data`
    vols[volumeName] = { driver: 'local' }
  }

  return vols
}
