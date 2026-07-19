export interface UseLogStreamOptions {
  serviceId?: string
  databaseId?: string
}

export interface UseLogStreamResult {
  /** Resolved container id, null while the entity has none. */
  containerId: string | null
  logLines: string[]
  isLoading: boolean
}

export interface LogViewerProps {
  serviceId?: string
  databaseId?: string
  className?: string
}
