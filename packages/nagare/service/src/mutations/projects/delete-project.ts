import { createLogger } from '@mizu/logger'
import { databaseTable, environmentTable, projectTable, serviceTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { syncIngressSafe } from '../../ingress'
import { deployNamespace, forceRemoveContainer, removeDeployNetwork } from '../../runtime'

const logger = createLogger('project:delete-project')

/**
 * Deletes a project: containers first (bounded force-remove, so a wedged VM
 * can't hang the delete), then rows (cascade), then every environment's
 * deploy network. Networks must not outlive the project — the ingress
 * container attaches to each one, and stale networks count against the VM
 * NIC limit until caddy can't boot at all.
 */
export const deleteProject = async (projectId: string): Promise<void> => {
  const [project] = await db.select().from(projectTable).where(eq(projectTable.id, projectId))
  if (!project) return

  const [environments, services, databases] = await Promise.all([
    db
      .select({ slug: environmentTable.slug, isDefault: environmentTable.isDefault })
      .from(environmentTable)
      .where(eq(environmentTable.projectId, projectId)),
    db
      .select({ containerId: serviceTable.containerId })
      .from(serviceTable)
      .where(eq(serviceTable.projectId, projectId)),
    db
      .select({ containerId: databaseTable.containerId })
      .from(databaseTable)
      .where(eq(databaseTable.projectId, projectId)),
  ])

  for (const entity of [...services, ...databases]) {
    if (!entity.containerId) continue
    try {
      await forceRemoveContainer(entity.containerId)
    } catch (error) {
      logger.warn(
        { projectId, containerId: entity.containerId, error: String(error) },
        'Failed to remove container during project deletion',
      )
    }
  }

  await db.delete(projectTable).where(eq(projectTable.id, projectId))

  for (const environment of environments) {
    await removeDeployNetwork(
      deployNamespace(project.slug, environment.slug, environment.isDefault),
    )
  }

  logger.info({ projectId, name: project.name }, 'Project deleted')
  syncIngressSafe()
}
