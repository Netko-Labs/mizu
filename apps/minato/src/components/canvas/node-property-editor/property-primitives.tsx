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
    <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-neutral-700">
      # {title}
    </div>
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
      <span className="text-neutral-700">&#x25b8;</span>
      <span className="min-w-[80px] shrink-0 text-neutral-600">{label}</span>
      <span
        className={cn(
          'truncate',
          accent ? 'text-blue-500' : 'text-neutral-400',
          mono && 'font-mono text-[11px]',
        )}
      >
        {value ?? '—'}
      </span>
      {copyable && value && (
        <button
          type="button"
          onClick={handleCopy}
          className="ml-auto shrink-0 text-neutral-700 hover:text-neutral-400"
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
        <span className="text-neutral-700">&#x25b8;</span>
        <span className="min-w-[80px] shrink-0 text-neutral-600">{label}</span>
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
          className="flex-1 border-b border-blue-500/50 bg-transparent text-xs text-neutral-300 outline-none"
        />
        <button
          type="button"
          onClick={handleSave}
          className="shrink-0 text-blue-500 hover:text-blue-400"
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
      <span className="text-neutral-700">&#x25b8;</span>
      <span className="min-w-[80px] shrink-0 text-neutral-600">{label}</span>
      <span className="truncate text-neutral-400 group-hover:text-neutral-200">{value || '—'}</span>
      <span className="ml-auto shrink-0 text-neutral-800 group-hover:text-neutral-500">
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
        'flex items-center gap-1.5 rounded border px-2.5 py-1 text-[10px] transition-all disabled:opacity-50',
        destructive
          ? 'border-red-500/20 text-red-500 hover:border-red-500/40 hover:bg-red-500/5'
          : 'border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200',
      )}
    >
      {icon}
      {label}
    </button>
  )
}

export function SourceTypeIcon({ type }: SourceTypeIconProps) {
  const cls = 'size-3 text-neutral-500'
  switch (type) {
    case 'image':
      return <IconBox className={cls} />
    case 'git':
      return <IconBrandGit className={cls} />
    case 'template':
      return <IconFileCode className={cls} />
  }
}
