import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

/**
 * Check if a path exists.
 */
export async function exists(path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

/**
 * Ensure a directory exists (create if not).
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true })
  } catch (error) {
    // Ignore if already exists
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error
    }
  }
}

/**
 * Write a file atomically (write to temp then rename).
 * Ensures the parent directory exists.
 */
export async function writeFileAtomic(filePath: string, content: string): Promise<void> {
  const dir = dirname(filePath)
  await ensureDir(dir)

  // Write to temp file first
  const tempPath = `${filePath}.tmp.${Date.now()}`

  try {
    await writeFile(tempPath, content, 'utf-8')
    // Rename atomically (on most filesystems)
    const { rename } = await import('node:fs/promises')
    await rename(tempPath, filePath)
  } catch (error) {
    // Clean up temp file on error
    try {
      await rm(tempPath, { force: true })
    } catch {
      // Ignore cleanup errors
    }
    throw error
  }
}

/**
 * Read a file's content.
 */
export async function readFileContent(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, 'utf-8')
  } catch {
    return null
  }
}

/**
 * Remove a file or directory.
 */
export async function remove(path: string): Promise<void> {
  await rm(path, { recursive: true, force: true })
}

/**
 * List files in a directory.
 */
export async function listDir(dirPath: string): Promise<string[]> {
  try {
    const { readdir } = await import('node:fs/promises')
    return await readdir(dirPath)
  } catch {
    return []
  }
}
