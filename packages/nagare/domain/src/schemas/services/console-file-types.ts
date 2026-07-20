/**
 * Response shapes for the console + files routes. Owned by domain so the
 * frontend can type responses without importing server code (eden@1.4 infers
 * complex objects as `{}` under Elysia 2; the api layer casts against these).
 */

export interface ExecResult {
  stdout: string
  stderr: string
  exitCode: number
  timedOut: boolean
}

export interface ServiceFileEntry {
  name: string
  type: 'file' | 'dir'
  size: number
  modifiedAt: string
}

export interface ServiceFileListing {
  /** Normalized relative path of the listed directory ('' = root). */
  path: string
  entries: ServiceFileEntry[]
}

export interface ServiceFileContent {
  path: string
  content: string
  /** True when the file exceeded the editable size and was cut off. */
  truncated: boolean
}
