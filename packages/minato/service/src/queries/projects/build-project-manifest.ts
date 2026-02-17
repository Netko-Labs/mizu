import { type Project, type Workspace, workspaceTable } from '@mizu/minato-domain'
import { db } from '@mizu/minato-repository'
import { eq } from 'drizzle-orm'
import type { ProjectManifest } from '../../generators/types'
import { listConnectionsForProject } from '../connections/list-connections'
import { getProjectWithServices } from './get-project-with-services'

interface BuildManifestResult {
  manifest: ProjectManifest
  workspace: Workspace
}

export async function buildProjectManifest(projectId: string): Promise<BuildManifestResult | null> {
  const project = await getProjectWithServices(projectId)

  if (!project || !project.workspaceId) {
    return null
  }

  const [workspace] = await db
    .select()
    .from(workspaceTable)
    .where(eq(workspaceTable.id, project.workspaceId))

  if (!workspace) {
    return null
  }

  const connections = await listConnectionsForProject(projectId)

  const manifest = {
    workspace: {
      name: workspace.name,
      slug: workspace.slug,
    },
    project: {
      name: project.name,
      slug: project.slug,
      description: project.description ?? null,
      settings: project.settings as Project['settings'],
    },
    services: project.services,
    databases: project.databases,
    volumes: [],
    networks: [],
    envGroups: [],
    externalServices: [],
    connections,
  }

  return { manifest, workspace: workspace as Workspace }
}
