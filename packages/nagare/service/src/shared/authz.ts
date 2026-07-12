/**
 * Ownership guards. Every resource in nagare is rooted at a project, and a
 * project belongs to exactly one team (organizationId). These asserts resolve
 * a resource up to its project and confirm it belongs to the caller's active
 * team — throwing AuthzError (→ 403) otherwise. Call one before any by-id
 * operation; list/create paths scope by organizationId directly in the query.
 */

import {
  databaseTable,
  environmentTable,
  projectTable,
  serviceConnectionTable,
  serviceTable,
} from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'

// `status` is read by Elysia's default error renderer, so a thrown error maps
// to the right HTTP code without the app-level handler returning a body (which
// would widen the eden-inferred App response types).
export class AuthzError extends Error {
  readonly status = 403
  constructor(message = 'Forbidden') {
    super(message)
    this.name = 'AuthzError'
  }
}

export class NotFoundError extends Error {
  readonly status = 404
  constructor(message = 'Not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

/** A well-formed request that conflicts with current state (→ 409). */
export class ConflictError extends Error {
  readonly status = 409
  constructor(message = 'Conflict') {
    super(message)
    this.name = 'ConflictError'
  }
}

/** Assert a project belongs to the team; returns the project row. */
export async function assertProjectOwned(projectId: string, organizationId: string) {
  const [project] = await db.select().from(projectTable).where(eq(projectTable.id, projectId))
  if (!project) throw new NotFoundError('Project not found')
  if (project.organizationId !== organizationId) throw new AuthzError()
  return project
}

/** Assert an environment's project belongs to the team; returns the env row. */
export async function assertEnvironmentOwned(environmentId: string, organizationId: string) {
  const [row] = await db
    .select({ environment: environmentTable, organizationId: projectTable.organizationId })
    .from(environmentTable)
    .innerJoin(projectTable, eq(environmentTable.projectId, projectTable.id))
    .where(eq(environmentTable.id, environmentId))
  if (!row) throw new NotFoundError('Environment not found')
  if (row.organizationId !== organizationId) throw new AuthzError()
  return row.environment
}

/** Assert a service's project belongs to the team; returns the service row. */
export async function assertServiceOwned(serviceId: string, organizationId: string) {
  const [row] = await db
    .select({ service: serviceTable, organizationId: projectTable.organizationId })
    .from(serviceTable)
    .innerJoin(projectTable, eq(serviceTable.projectId, projectTable.id))
    .where(eq(serviceTable.id, serviceId))
  if (!row) throw new NotFoundError('Service not found')
  if (row.organizationId !== organizationId) throw new AuthzError()
  return row.service
}

/** Assert a database's project belongs to the team; returns the database row. */
export async function assertDatabaseOwned(databaseId: string, organizationId: string) {
  const [row] = await db
    .select({ database: databaseTable, organizationId: projectTable.organizationId })
    .from(databaseTable)
    .innerJoin(projectTable, eq(databaseTable.projectId, projectTable.id))
    .where(eq(databaseTable.id, databaseId))
  if (!row) throw new NotFoundError('Database not found')
  if (row.organizationId !== organizationId) throw new AuthzError()
  return row.database
}

/** Assert a connection's source service's project belongs to the team. */
export async function assertConnectionOwned(connectionId: string, organizationId: string) {
  const [row] = await db
    .select({
      connection: serviceConnectionTable,
      organizationId: projectTable.organizationId,
    })
    .from(serviceConnectionTable)
    .innerJoin(serviceTable, eq(serviceConnectionTable.fromServiceId, serviceTable.id))
    .innerJoin(projectTable, eq(serviceTable.projectId, projectTable.id))
    .where(eq(serviceConnectionTable.id, connectionId))
  if (!row) throw new NotFoundError('Connection not found')
  if (row.organizationId !== organizationId) throw new AuthzError()
  return row.connection
}
