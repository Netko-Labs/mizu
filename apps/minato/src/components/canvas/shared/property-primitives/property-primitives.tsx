import {
  IconBox,
  IconBrandGit,
  IconCheck,
  IconCopy,
  IconFileCode,
  IconPencil,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import {
  type ActionButtonProps,
  type EditablePropertyLineProps,
  type PropertyLineProps,
  type SectionHeaderProps,
  type SourceTypeIconProps,
  useEditableProperty,
} from './lib'

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="mb-2 text-[11px] font-medium tracking-wide text-muted-foreground">{title}</div>
  )
}

export function PropertyLine({
  label,
  value,
  accent = false,
  mono = false,
  copyable = false,
}: PropertyLineProps) {
  const handleCopy = () => {
    if (value) navigator.clipboard.writeText(String(value))
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="min-w-[88px] shrink-0 text-muted-foreground">{label}</span>
      <span
        className={cn(
          'truncate',
          accent ? 'text-primary' : 'text-foreground/80',
          mono && 'font-mono text-[11px]',
        )}
      >
        {value ?? '—'}
      </span>
      {copyable && value && (
        <button
          type="button"
          onClick={handleCopy}
          className="ml-auto shrink-0 text-muted-foreground/60 transition-colors hover:text-foreground"
        >
          <IconCopy className="size-3" />
        </button>
      )}
    </div>
  )
}

export function EditablePropertyLine({ label, value, onSave }: EditablePropertyLineProps) {
  const { editing, draft, setDraft, inputRef, handleSave, startEditing, cancelEditing } =
    useEditableProperty({ value, onSave })

  if (editing) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="min-w-[88px] shrink-0 text-muted-foreground">{label}</span>
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') {
              cancelEditing()
            }
          }}
          onBlur={handleSave}
          className="flex-1 border-b border-primary/50 bg-transparent text-xs text-foreground outline-none"
        />
        <button
          type="button"
          onClick={handleSave}
          className="shrink-0 text-primary transition-colors hover:text-primary/80"
        >
          <IconCheck className="size-3" />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      className="group flex w-full items-center gap-2 text-left text-xs"
      onClick={startEditing}
    >
      <span className="min-w-[88px] shrink-0 text-muted-foreground">{label}</span>
      <span className="truncate text-foreground/80 group-hover:text-foreground">{value || '—'}</span>
      <span className="ml-auto shrink-0 text-transparent transition-colors group-hover:text-muted-foreground">
        <IconPencil className="size-3" />
      </span>
    </button>
  )
}

export function ActionButton({
  label,
  icon,
  onClick,
  destructive = false,
  disabled = false,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] transition-all disabled:opacity-50',
        destructive
          ? 'border-destructive/30 text-destructive hover:border-destructive/60 hover:bg-destructive/10'
          : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground',
      )}
    >
      {icon}
      {label}
    </button>
  )
}

export function SourceTypeIcon({ type }: SourceTypeIconProps) {
  const cls = 'size-3 text-muted-foreground'
  switch (type) {
    case 'image':
      return <IconBox className={cls} />
    case 'git':
      return <IconBrandGit className={cls} />
    case 'template':
      return <IconFileCode className={cls} />
  }
}
