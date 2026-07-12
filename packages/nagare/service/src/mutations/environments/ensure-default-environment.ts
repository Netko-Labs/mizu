import { type Environment, environmentTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { and, eq } from 'drizzle-orm'
import { createEnvironment } from './create-environment'

export const DEFAULT_ENVIRONMENT_NAME = 'production'

/** The project's default environment, creating a 'production' one if missing. */
export const ensureDefaultEnvironment = async (projectId: string): Promise<Environment> => {
  const [existing] = await db
    .select()
    .from(environmentTable)
    .where(and(eq(environmentTable.projectId, projectId), eq(environmentTable.isDefault, true)))
    .limit(1)

  if (existing) return existing as Environment
  return createEnvironment({ projectId, name: DEFAULT_ENVIRONMENT_NAME, isDefault: true })
}

/**
 * Resolve an optional environment id to a concrete one within the project,
 * falling back to the default environment. An id that doesn't belong to the
 * project is ignored (falls back), so callers can't plant entities in another
 * project's environment.
 */
export const resolveEnvironmentId = async (
  projectId: string,
  environmentId?: string,
): Promise<string> => {
  if (environmentId) {
    const [env] = await db
      .select({ id: environmentTable.id })
      .from(environmentTable)
      .where(and(eq(environmentTable.id, environmentId), eq(environmentTable.projectId, projectId)))
      .limit(1)
    if (env) return env.id
  }

  const fallback = await ensureDefaultEnvironment(projectId)
  return fallback.id
}
