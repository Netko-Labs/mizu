import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import type { z } from 'zod'
import { type DatabaseStatus, type DatabaseType, databaseTable } from '../db'

/**
 * 🐱 Database Schemas 🐱
 * Validation for your data catnaps
 */
export const DatabaseInsertSchema = createInsertSchema(databaseTable)
export type DatabaseInsert = z.infer<typeof DatabaseInsertSchema>

export const DatabaseUpdateSchema = createUpdateSchema(databaseTable).required({ id: true })
export type DatabaseUpdate = z.infer<typeof DatabaseUpdateSchema>

export const DatabaseSchema = createSelectSchema(databaseTable)
export type Database = z.infer<typeof DatabaseSchema>

// Re-export types from db
export type { DatabaseStatus, DatabaseType }

/** Database credentials structure (encrypted in DB) */
export interface DatabaseCredentials {
  username: string
  password: string
  database: string
  rootPassword?: string
}

/** Database connection info for services */
export interface DatabaseConnectionInfo {
  host: string
  port: number
  username: string
  password: string
  database: string
  connectionString: string
}
