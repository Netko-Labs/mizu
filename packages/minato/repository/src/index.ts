// Re-export drizzle query operators from the SAME module instance that builds
// `db`, so consumers never accidentally mix two hoisted drizzle-orm copies.
export { and, eq, sql } from 'drizzle-orm'
export { db } from './db/client'
