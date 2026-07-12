import { environmentTable, type ProjectSettings, projectTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { deployNamespace } from '../../runtime'

export interface DeployContext {
  /** Container/network/host prefix for this project+environment. */
  namespace: string
  /** Per-project base-domain override from project.settings.domain, if set. */
  domainOverride?: string
}

/**
 * Resolve the deploy namespace (project + environment) and the project's
 * optional base-domain override for a given environment. Used by the deploy
 * paths and ingress so every deployed artifact of an environment shares one
 * isolated namespace.
 */
export const getDeployContext = async (
  environmentId: string,
): Promise<DeployContext | undefined> => {
  const [row] = await db
    .select({
      envSlug: environmentTable.slug,
      isDefault: environmentTable.isDefault,
      projectSlug: projectTable.slug,
      settings: projectTable.settings,
    })
    .from(environmentTable)
    .innerJoin(projectTable, eq(environmentTable.projectId, projectTable.id))
    .where(eq(environmentTable.id, environmentId))
    .limit(1)

  if (!row) return undefined

  const settings = (row.settings ?? {}) as ProjectSettings
  return {
    namespace: deployNamespace(row.projectSlug, row.envSlug, row.isDefault),
    domainOverride: settings.domain,
  }
}
