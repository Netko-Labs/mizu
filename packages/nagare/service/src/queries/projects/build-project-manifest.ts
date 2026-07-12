import type { Project } from '@mizu/nagare-domain'
import type { ProjectManifest } from '../../generators/types'
import { listConnectionsForProject } from '../connections/list-connections'
import { getProjectWithServices } from './get-project-with-services'

interface BuildManifestResult {
  manifest: ProjectManifest
  organizationId: string
}

export async function buildProjectManifest(projectId: string): Promise<BuildManifestResult | null> {
  const project = await getProjectWithServices(projectId)
  if (!project) {
    return null
  }

  const connections = await listConnectionsForProject(projectId)

  const manifest: ProjectManifest = {
    // nagare only knows the team by id (the human name lives in minato); the
    // id is a stable slug for the export directory + manifest.
    team: { name: project.organizationId, slug: project.organizationId },
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

  return { manifest, organizationId: project.organizationId }
}
