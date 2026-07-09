import { generateAllFiles } from '../../generators'
import type { GeneratedFiles } from '../../generators/types'
import { buildProjectManifest } from './build-project-manifest'

export async function getProjectFiles(projectId: string): Promise<GeneratedFiles | null> {
  const built = await buildProjectManifest(projectId)

  if (!built) {
    return null
  }

  return generateAllFiles(built.manifest)
}
