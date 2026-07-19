import { IconCopy, IconEye, IconEyeOff, IconX } from '@tabler/icons-react'
import { useState } from 'react'
import type { VariableRowProps } from './lib/types'

/** One env var: mono name, masked editable value, reveal/copy/remove. */
export function VariableRow({ name, value, onChange, onRemove }: VariableRowProps) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="flex items-center gap-1.5 rounded-md border border-border bg-background/60 px-2 py-1.5">
      <span className="w-[38%] shrink-0 truncate font-mono text-[11px] text-foreground/90">
        {name}
      </span>
      <input
        type={revealed ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent font-mono text-[11px] text-foreground/80 outline-none placeholder:text-muted-foreground/50 focus:text-foreground"
        placeholder="empty"
      />
      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        className="shrink-0 text-muted-foreground/60 transition-colors hover:text-foreground"
        aria-label={revealed ? 'hide value' : 'reveal value'}
      >
        {revealed ? <IconEyeOff className="size-3" /> : <IconEye className="size-3" />}
      </button>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(value)}
        className="shrink-0 text-muted-foreground/60 transition-colors hover:text-foreground"
        aria-label="copy value"
      >
        <IconCopy className="size-3" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 text-muted-foreground/60 transition-colors hover:text-destructive"
        aria-label="remove variable"
      >
        <IconX className="size-3" />
      </button>
    </div>
  )
}
