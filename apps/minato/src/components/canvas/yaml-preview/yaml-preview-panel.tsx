'use client'

import { code } from '@streamdown/code'
import { IconCheck, IconCopy, IconFile } from '@tabler/icons-react'
import { useCallback, useMemo, useState } from 'react'
import { Streamdown } from 'streamdown'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface YamlPreviewPanelProps {
  mizuYaml: string
  className?: string
  onExport?: () => void
}

export function YamlPreviewPanel({ mizuYaml, className, onExport }: YamlPreviewPanelProps) {
  const [copied, setCopied] = useState(false)

  // Wrap YAML in markdown code block for syntax highlighting
  const markdownContent = useMemo(() => {
    return `\`\`\`yaml\n${mizuYaml}\n\`\`\``
  }, [mizuYaml])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(mizuYaml)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [mizuYaml])

  return (
    <div className={cn('flex h-full flex-col bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <IconFile className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">mizu.yml</span>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2">
            {copied ? (
              <IconCheck className="size-4 text-green-500" />
            ) : (
              <IconCopy className="size-4" />
            )}
          </Button>

          {onExport && (
            <Button variant="secondary" size="sm" onClick={onExport} className="h-7 px-2 text-xs">
              Export
            </Button>
          )}
        </div>
      </div>

      {/* YAML content with syntax highlighting */}
      <div className="flex-1 overflow-auto p-3 font-mono text-xs">
        <Streamdown
          plugins={{ code }}
          className="[&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!text-xs"
        >
          {markdownContent}
        </Streamdown>
      </div>
    </div>
  )
}
