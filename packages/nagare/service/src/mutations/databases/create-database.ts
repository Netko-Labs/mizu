import { randomBytes } from 'node:crypto'
import {
  type Database,
  type DatabaseCredentials,
  type DatabaseType,
  databaseTable,
} from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { encrypt } from '../../shared/crypto'

const DEFAULT_PORTS: Record<DatabaseType, number> = {
  postgres: 5432,
  mysql: 3306,
  redis: 6379,
  mongodb: 27017,
  mariadb: 3306,
}

const DEFAULT_VERSIONS: Record<DatabaseType, string> = {
  postgres: '16',
  mysql: '8',
  redis: '7',
  mongodb: '7',
  mariadb: '11',
}

/**
 * Generates a random secure password.
 */
const generatePassword = (length = 24): string => {
  return randomBytes(length).toString('base64url').slice(0, length)
}

/**
 * Generates a random database name.
 */
const generateDatabaseName = (baseName: string): string => {
  const safeName = baseName.toLowerCase().replace(/[^a-z0-9]/g, '_')
  return `${safeName}_db`
}

/**
 * Creates a new database with auto-generated credentials.
 */
export const createDatabase = async (data: {
  projectId: string
  type: DatabaseType
  name: string
  version?: string
}): Promise<Database | undefined> => {
  const existingDatabases = await db
    .select({ id: databaseTable.id })
    .from(databaseTable)
    .where(eq(databaseTable.projectId, data.projectId))

  // Generate credentials
  const credentials: DatabaseCredentials = {
    username: `${data.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_user`,
    password: generatePassword(),
    database: generateDatabaseName(data.name),
    rootPassword: data.type !== 'redis' ? generatePassword() : undefined,
  }

  // Encrypt credentials before storing
  const encryptedCredentials = encrypt(JSON.stringify(credentials))

  return await db
    .insert(databaseTable)
    .values({
      projectId: data.projectId,
      type: data.type,
      name: data.name,
      version: data.version || DEFAULT_VERSIONS[data.type],
      credentials: encryptedCredentials,
      port: DEFAULT_PORTS[data.type],
      canvasPosition: {
        x: 100 + existingDatabases.length * 220,
        y: 300,
      },
    })
    .returning()
    .then(([result]) => result)
}
