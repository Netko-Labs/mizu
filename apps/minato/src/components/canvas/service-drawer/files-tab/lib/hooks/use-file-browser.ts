import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { fileKeys, fileQueries, writeServiceFile } from '@/shared/api'
import type { UseFileBrowserResult } from '../types'

/**
 * Directory navigation + single-file editor over the service's host file
 * area. Browsing state is per-drawer-instance; saves invalidate the file's
 * content query so a reopen shows the committed text.
 */
export function useFileBrowser(serviceId: string): UseFileBrowserResult {
  const queryClient = useQueryClient()
  const [dir, setDir] = useState('')
  const [openFile, setOpenFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState('')

  const listing = useQuery(fileQueries.list(serviceId, dir))
  const content = useQuery({
    ...fileQueries.content(serviceId, openFile ?? ''),
    enabled: openFile !== null,
  })

  useEffect(() => {
    if (content.data) setFileContent(content.data.content)
  }, [content.data])

  const mutation = useMutation({
    mutationFn: () => writeServiceFile({ serviceId, path: openFile ?? '', content: fileContent }),
    onSuccess: () => {
      if (openFile) {
        queryClient.invalidateQueries({ queryKey: fileKeys.content(serviceId, openFile) })
        queryClient.invalidateQueries({ queryKey: fileKeys.list(serviceId, dir) })
      }
    },
  })

  return {
    dir,
    entries: listing.data?.entries ?? [],
    isLoading: listing.isLoading,
    openDir: (path) => {
      setOpenFile(null)
      setDir(path)
    },
    openFile,
    fileContent,
    setFileContent,
    fileTruncated: content.data?.truncated ?? false,
    fileLoading: content.isLoading,
    dirty: content.data ? fileContent !== content.data.content : false,
    openFileAt: (path) => {
      setFileContent('')
      setOpenFile(path)
    },
    closeFile: () => setOpenFile(null),
    save: () => mutation.mutate(),
    isSaving: mutation.isPending,
  }
}
