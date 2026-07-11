import type { SettingsStatRowProps } from '../lib'

export function SettingsStatRow({ label, value, accent = false }: SettingsStatRowProps) {
  return (
    <div className="flex items-center gap-3 font-mono text-xs">
      <span className="shrink-0 text-neutral-600">{label}</span>
      <span className="min-w-4 flex-1 border-b border-dotted border-neutral-800" />
      <span className={accent ? 'shrink-0 text-blue-500' : 'shrink-0 text-neutral-400'}>
        {value ?? '—'}
      </span>
    </div>
  )
}
