import { IconArrowLeft, IconFile, IconFolder } from '@tabler/icons-react'
import { githubDark } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { breadcrumbSegments, languageExtension, useFileBrowser } from './lib'
import type { FilesTabProps } from './lib/types'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Browse + edit the service's host file area: template config files and
 * persistent volume dirs. Bind-mounted paths reflect inside the running
 * container as soon as they're saved.
 */
export function FilesTab({ service }: FilesTabProps) {
  const browser = useFileBrowser(service.id)

  // Editor view
  if (browser.openFile !== null) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <button
            type="button"
            onClick={browser.closeFile}
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="back to listing"
          >
            <IconArrowLeft className="size-3.5" />
          </button>
          <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground/90">
            {browser.openFile}
          </span>
          {browser.dirty && (
            <Button size="xs" onClick={browser.save} disabled={browser.isSaving}>
              {browser.isSaving ? <Spinner className="size-3" /> : 'Save'}
            </Button>
          )}
        </div>
        {browser.fileTruncated && (
          <div className="border-b border-amber-500/20 bg-amber-500/5 px-3 py-1 text-[10px] text-amber-400">
            File exceeds the editor limit — showing the first 512KB read-only; saving would truncate
            it.
          </div>
        )}
        {browser.fileLoading ? (
          <div className="flex items-center gap-2 p-4 text-xs text-muted-foreground">
            <Spinner className="size-3" /> Loading…
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-hidden">
            <CodeMirror
              value={browser.fileContent}
              onChange={(value) => browser.setFileContent(value)}
              theme={githubDark}
              extensions={languageExtension(browser.openFile)}
              editable={!browser.fileTruncated}
              readOnly={browser.fileTruncated}
              height="100%"
              className="h-full text-[12px]"
              basicSetup={{ lineNumbers: true, foldGutter: false }}
            />
          </div>
        )}
      </div>
    )
  }

  // Listing view — directories first, then files, each alphabetical.
  const entries = [...browser.entries].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
  const crumbs = breadcrumbSegments(browser.dir)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-2 font-mono text-[11px] text-muted-foreground">
        <button
          type="button"
          onClick={() => browser.openDir('')}
          className="shrink-0 transition-colors hover:text-foreground"
        >
          /
        </button>
        {crumbs.map((crumb) => (
          <span key={crumb.path} className="flex min-w-0 items-center gap-1.5">
            <span aria-hidden className="text-muted-foreground/50">
              /
            </span>
            <button
              type="button"
              onClick={() => browser.openDir(crumb.path)}
              className="truncate transition-colors hover:text-foreground"
            >
              {crumb.label}
            </button>
          </span>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-2">
        {browser.isLoading && (
          <div className="flex items-center gap-2 p-2 text-xs text-muted-foreground">
            <Spinner className="size-3" /> Loading…
          </div>
        )}
        {!browser.isLoading && entries.length === 0 && (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Nothing here — config files and persistent volumes appear once the service deploys with
            them.
          </div>
        )}
        {entries.map((entry) => {
          const path = browser.dir ? `${browser.dir}/${entry.name}` : entry.name
          return (
            <button
              key={entry.name}
              type="button"
              onClick={() =>
                entry.type === 'dir' ? browser.openDir(path) : browser.openFileAt(path)
              }
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-background/60"
            >
              {entry.type === 'dir' ? (
                <IconFolder className="size-3.5 shrink-0 text-primary/70" />
              ) : (
                <IconFile className="size-3.5 shrink-0 text-muted-foreground" />
              )}
              <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground/90">
                {entry.name}
              </span>
              {entry.type === 'file' && (
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {formatSize(entry.size)}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
