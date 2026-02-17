'use client'

import { code } from '@streamdown/code'
import { IconCheck, IconChevronRight, IconCopy, IconFile } from '@tabler/icons-react'
import { useCallback, useMemo, useState } from 'react'
import { Streamdown } from 'streamdown'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type YamlFormat = 'docker-compose' | 'mizu'

interface YamlPreviewPanelProps {
  dockerComposeYaml: string
  mizuYaml: string
  className?: string
  onExport?: () => void
}

export function YamlPreviewPanel({
  dockerComposeYaml,
  mizuYaml,
  className,
  onExport,
}: YamlPreviewPanelProps) {
  const [format, setFormat] = useState<YamlFormat>('docker-compose')
  const [copied, setCopied] = useState(false)

  const currentYaml = useMemo(() => {
    return format === 'docker-compose' ? dockerComposeYaml : mizuYaml
  }, [format, dockerComposeYaml, mizuYaml])

  // Wrap YAML in markdown code block for syntax highlighting
  const markdownContent = useMemo(() => {
    return `\`\`\`yaml\n${currentYaml}\n\`\`\``
  }, [currentYaml])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(currentYaml)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [currentYaml])

  const toggleFormat = useCallback(() => {
    setFormat((prev) => (prev === 'docker-compose' ? 'mizu' : 'docker-compose'))
  }, [])

  return (
    <div className={cn('flex h-full flex-col bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <IconFile className="size-4 text-muted-foreground" />
          <button
            type="button"
            onClick={toggleFormat}
            className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
          >
            <span>
              {format === 'docker-compose' ? 'docker-compose.yml' : 'mizu.yml'}
            </span>
            <IconChevronRight className="size-3 text-muted-foreground" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2"
          >
            {copied ? (
              <IconCheck className="size-4 text-green-500" />
            ) : (
              <IconCopy className="size-4" />
            )}
          </Button>

          {onExport && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onExport}
              className="h-7 px-2 text-xs"
            >
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Format tabs */}
      <div className="flex gap-1 border-b px-2 py-1">
        <button
          type="button"
          onClick={() => setFormat('docker-compose')}
          className={cn(
            'rounded-md px-2 py-1 text-xs transition-colors',
            format === 'docker-compose'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          docker-compose.yml
        </button>
        <button
          type="button"
          onClick={() => setFormat('mizu')}
          className={cn(
            'rounded-md px-2 py-1 text-xs transition-colors',
            format === 'mizu'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          mizu.yml
        </button>
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
