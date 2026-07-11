import type { ProjectManifest } from '../generators/types'
import { writeProjectFiles } from './project-files'

/**
 * Sync result indicating what was changed.
 */
export interface SyncResult {
  success: boolean
  filesWritten: string[]
  errors: string[]
}

/**
 * Export a project to disk (DB -> Files).
 *
 * This writes the current state from the database to the filesystem.
 * Use this when you want to persist changes made in the UI.
 */
export async function exportProject(manifest: ProjectManifest): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    filesWritten: [],
    errors: [],
  }

  try {
    await writeProjectFiles(manifest)
    result.filesWritten = ['mizu.yml', '.env', '.env.example']
  } catch (error) {
    result.success = false
    result.errors.push(error instanceof Error ? error.message : String(error))
  }

  return result
}

/**
 * Build a manifest from raw file contents.
 * This is a placeholder for file -> manifest parsing logic.
 *
 * Since files are the source of truth, this would be used to:
 * 1. Read files on startup
 * 2. Parse mizu.yml
 * 3. Build the ProjectManifest
 * 4. Sync to database for fast querying
 */
export async function buildManifestFromFiles(
  _workspaceSlug: string,
  _projectSlug: string,
): Promise<ProjectManifest | null> {
  // TODO: Implement file -> manifest parsing
  // This requires:
  // 1. Reading and parsing mizu.yml to extract services, databases, volumes, networks
  // 2. Reading .env for environment variables
  // 3. Building the full ProjectManifest

  // For now, return null - files are written from DB state
  return null
}

/**
 * Sync files to database (Files -> DB).
 *
 * Reads project files and updates the database to match.
 * The database acts as a cache for fast querying.
 *
 * @returns The synced manifest, or null if files don't exist
 */
export async function syncFilesToDb(
  workspaceSlug: string,
  projectSlug: string,
): Promise<ProjectManifest | null> {
  const manifest = await buildManifestFromFiles(workspaceSlug, projectSlug)

  if (!manifest) {
    return null
  }

  // TODO: Update database with manifest data
  // This would involve:
  // 1. Upserting workspace
  // 2. Upserting project
  // 3. Syncing services, databases, volumes, networks, etc.
  // 4. Rebuilding connections based on mizu.yml dependsOn

  return manifest
}
