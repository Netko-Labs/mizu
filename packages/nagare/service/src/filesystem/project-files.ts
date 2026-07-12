import { join } from 'node:path'
import { generateAllFiles, type MizuYml, parseMizuYml as parseMizuYmlContent } from '../generators'
import type { GeneratedFiles, ProjectManifest } from '../generators/types'
import { ensureDir, exists, readFileContent, remove, writeFileAtomic } from './operations'
import { getProjectFilePaths, getProjectPath, getWorkspacePath } from './paths'

/**
 * Write all project files to disk.
 * Files are the source of truth - this generates and saves them.
 */
export async function writeProjectFiles(
  manifest: ProjectManifest,
  options: { includeComments?: boolean } = {},
): Promise<void> {
  const files = await generateAllFiles(manifest, options)
  const paths = getProjectFilePaths(manifest.team.slug, manifest.project.slug)

  // Ensure project directory exists
  await ensureDir(paths.dir)

  // Write all files atomically
  await Promise.all([
    writeFileAtomic(paths.mizuYml, files['mizu.yml']),
    writeFileAtomic(paths.env, files['.env']),
    writeFileAtomic(paths.envExample, files['.env.example']),
  ])

  // Best-effort cleanup of the legacy docker-compose.yml artifact
  try {
    await remove(join(paths.dir, 'docker-compose.yml'))
  } catch {
    // Nothing to clean up
  }
}

/**
 * Read project files from disk.
 * Returns the raw file contents.
 */
export async function readProjectFiles(
  workspaceSlug: string,
  projectSlug: string,
): Promise<Partial<GeneratedFiles>> {
  const paths = getProjectFilePaths(workspaceSlug, projectSlug)

  const [mizuYml, env, envExample] = await Promise.all([
    readFileContent(paths.mizuYml),
    readFileContent(paths.env),
    readFileContent(paths.envExample),
  ])

  return {
    ...(mizuYml && { 'mizu.yml': mizuYml }),
    ...(env && { '.env': env }),
    ...(envExample && { '.env.example': envExample }),
  }
}

/**
 * Check if a project exists on disk.
 */
export async function projectExists(workspaceSlug: string, projectSlug: string): Promise<boolean> {
  const paths = getProjectFilePaths(workspaceSlug, projectSlug)
  return exists(paths.mizuYml)
}

/**
 * Delete a project from disk.
 */
export async function deleteProject(workspaceSlug: string, projectSlug: string): Promise<void> {
  const projectDir = getProjectPath(workspaceSlug, projectSlug)
  await remove(projectDir)
}

/**
 * Delete a workspace from disk.
 */
export async function deleteWorkspace(workspaceSlug: string): Promise<void> {
  const workspaceDir = getWorkspacePath(workspaceSlug)
  await remove(workspaceDir)
}

/**
 * Parse the mizu.yml file from a project.
 */
export async function parseMizuYml(
  workspaceSlug: string,
  projectSlug: string,
): Promise<MizuYml | null> {
  const paths = getProjectFilePaths(workspaceSlug, projectSlug)
  const content = await readFileContent(paths.mizuYml)

  if (!content) {
    return null
  }

  try {
    return parseMizuYmlContent(content)
  } catch {
    return null
  }
}

/**
 * List all workspaces on disk.
 */
export async function listWorkspaces(): Promise<string[]> {
  const { listDir } = await import('./operations')
  const { getWorkspacesPath } = await import('./paths')
  return listDir(getWorkspacesPath())
}

/**
 * List all projects in a workspace on disk.
 */
export async function listProjects(workspaceSlug: string): Promise<string[]> {
  const { listDir } = await import('./operations')
  const { getWorkspacePath } = await import('./paths')
  return listDir(getWorkspacePath(workspaceSlug))
}
