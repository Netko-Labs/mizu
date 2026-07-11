import { homedir } from 'node:os'
import { join } from 'node:path'

/**
 * Get the Mizu home directory path.
 * Default: ~/.mizu/
 */
export function getMizuHome(): string {
  const customPath = process.env.MIZU_HOME
  if (customPath) {
    return customPath
  }
  return join(homedir(), '.mizu')
}

/**
 * Get the config file path.
 * ~/.mizu/config.json
 */
export function getConfigPath(): string {
  return join(getMizuHome(), 'config.json')
}

/**
 * Get the workspaces directory path.
 * ~/.mizu/workspaces/
 */
export function getWorkspacesPath(): string {
  return join(getMizuHome(), 'workspaces')
}

/**
 * Get a workspace directory path.
 * ~/.mizu/workspaces/{workspace-slug}/
 */
export function getWorkspacePath(workspaceSlug: string): string {
  return join(getWorkspacesPath(), workspaceSlug)
}

/**
 * Get a project directory path.
 * ~/.mizu/workspaces/{workspace-slug}/{project-slug}/
 */
export function getProjectPath(workspaceSlug: string, projectSlug: string): string {
  return join(getWorkspacePath(workspaceSlug), projectSlug)
}

/**
 * Get all project file paths.
 */
export function getProjectFilePaths(workspaceSlug: string, projectSlug: string) {
  const projectDir = getProjectPath(workspaceSlug, projectSlug)
  return {
    dir: projectDir,
    mizuYml: join(projectDir, 'mizu.yml'),
    env: join(projectDir, '.env'),
    envExample: join(projectDir, '.env.example'),
  }
}
