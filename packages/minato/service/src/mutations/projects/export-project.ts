import { exportProjectToFiles, type SyncResult } from '../../filesystem'
import { buildProjectManifest } from '../../queries/projects/build-project-manifest'

/**
 * Export a project to the filesystem.
 *
 * Fetches the complete project state from the database and writes
 * all generated files to ~/.mizu/{workspace}/{project}/
 */
export async function exportProject(projectId: string): Promise<SyncResult> {
  const built = await buildProjectManifest(projectId)

  if (!built) {
    return {
      success: false,
      filesWritten: [],
      errors: ['Project or workspace not found'],
    }
  }

  return exportProjectToFiles(built.manifest)
}
