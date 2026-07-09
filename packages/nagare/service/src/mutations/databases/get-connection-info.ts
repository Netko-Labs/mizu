import {
  type DatabaseConnectionInfo,
  type DatabaseCredentials,
  type DatabaseType,
  databaseTable,
} from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { decrypt } from '../../shared/crypto'

/**
 * Builds a connection string for the given database type and credentials.
 */
const buildConnectionString = (
  type: DatabaseType,
  host: string,
  port: number,
  credentials: DatabaseCredentials,
): string => {
  const { username, password, database } = credentials

  switch (type) {
    case 'postgres':
      return `postgresql://${username}:${password}@${host}:${port}/${database}`
    case 'mysql':
    case 'mariadb':
      return `mysql://${username}:${password}@${host}:${port}/${database}`
    case 'mongodb':
      return `mongodb://${username}:${password}@${host}:${port}/${database}`
    case 'redis':
      // Redis typically uses a simpler connection format
      return password ? `redis://:${password}@${host}:${port}` : `redis://${host}:${port}`
    default:
      return ''
  }
}

/**
 * Gets the connection info for a database.
 * Returns connection string and individual parameters.
 */
export const getDatabaseConnectionInfo = async (
  databaseId: string,
): Promise<DatabaseConnectionInfo | undefined> => {
  const database = await db
    .select()
    .from(databaseTable)
    .where(eq(databaseTable.id, databaseId))
    .then(([result]) => result)

  if (!database) {
    return undefined
  }

  if (!database.credentials) {
    throw new Error('Database credentials not found')
  }

  // Decrypt credentials
  const credentials: DatabaseCredentials = JSON.parse(decrypt(database.credentials))

  // For local development, host is localhost
  // TODO: In production, this should be the container name or network alias
  const host = 'localhost'
  const port = database.port || 5432

  const connectionString = buildConnectionString(
    database.type as DatabaseType,
    host,
    port,
    credentials,
  )

  return {
    host,
    port,
    username: credentials.username,
    password: credentials.password,
    database: credentials.database,
    connectionString,
  }
}
