import type { Service, ServiceFileEntry } from '@mizu/nagare-domain'
import type { Serialized } from '@/shared/api'

export interface FilesTabProps {
  service: Serialized<Service>
}

export interface UseFileBrowserResult {
  /** Current directory ('' = root). */
  dir: string
  entries: ServiceFileEntry[]
  isLoading: boolean
  openDir: (path: string) => void
  /** Path of the file open in the editor, null when browsing. */
  openFile: string | null
  fileContent: string
  setFileContent: (content: string) => void
  fileTruncated: boolean
  fileLoading: boolean
  dirty: boolean
  openFileAt: (path: string) => void
  closeFile: () => void
  save: () => void
  isSaving: boolean
}
