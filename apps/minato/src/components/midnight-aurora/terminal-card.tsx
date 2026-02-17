import { motion } from 'motion/react'
import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export function TerminalCard({
  title,
  children,
  delay = 0,
  className,
}: {
  title: string
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'group relative overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 font-mono',
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-800 transition-colors group-hover:bg-red-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-800 transition-colors group-hover:bg-yellow-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-800 transition-colors group-hover:bg-green-500" />
        </div>
        <span className="text-[11px] text-neutral-600">{title}</span>
      </div>
      <div className="relative p-5">{children}</div>
    </motion.div>
  )
}

export function StatLine({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string | number | undefined
  accent?: boolean
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-neutral-700">&#x25b8;</span>
      <span className="text-neutral-600">{label}:</span>
      <span className={accent ? 'text-blue-500' : 'text-neutral-400'}>{value ?? '\u2014'}</span>
    </div>
  )
}

export function ConfigLine({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string | undefined
  accent?: boolean
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-neutral-700">&#x25b8;</span>
      <span className="min-w-[100px] text-neutral-600">{label}</span>
      <span className={accent ? 'text-blue-500' : 'text-neutral-400'}>{value ?? '\u2014'}</span>
    </div>
  )
}

export function EditableField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-neutral-700">&#x25b8;</span>
      <span className="min-w-[100px] shrink-0 text-neutral-600">{label}</span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-7 rounded border-neutral-800 bg-black px-2 text-xs text-neutral-300 placeholder:text-neutral-700 focus-visible:border-blue-500/50 focus-visible:ring-0"
      />
    </div>
  )
}

export function ToggleField({
  label,
  checked,
  onCheckedChange,
  description,
}: {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  description?: string
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-neutral-700">&#x25b8;</span>
      <div className="min-w-[100px] shrink-0">
        <span className="text-neutral-600">{label}</span>
        {description && <div className="text-[10px] text-neutral-700">{description}</div>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} size="sm" />
      <span className="text-[10px] text-neutral-600">{checked ? 'true' : 'false'}</span>
    </div>
  )
}

export function SettingsItem({
  icon: Icon,
  label,
  description,
  status,
}: {
  icon: ComponentProps<'svg'> extends infer P
    ? React.ComponentType<P & { className?: string; strokeWidth?: number }>
    : never
  label: string
  description: string
  status?: 'active' | 'inactive'
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-black p-3 transition-all hover:border-neutral-700">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950">
        <Icon className="h-4 w-4 text-neutral-500" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-neutral-300">{label}</div>
        <div className="text-[10px] text-neutral-600">{description}</div>
      </div>
      {status && (
        <div
          className={
            status === 'active' ? 'text-[10px] text-green-500' : 'text-[10px] text-neutral-600'
          }
        >
          {status === 'active' ? '\u25cf online' : '\u25cb offline'}
        </div>
      )}
    </div>
  )
}
