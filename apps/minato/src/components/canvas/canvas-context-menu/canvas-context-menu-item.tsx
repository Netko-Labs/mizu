import type { MenuItemProps } from './lib/types'

export function MenuItem({
  label,
  icon,
  onClick,
  destructive = false,
  disabled = false,
}: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
        destructive
          ? 'text-red-400 disabled:opacity-50 hover:bg-red-500/10'
          : 'text-neutral-400 disabled:opacity-50 hover:bg-blue-500/10 hover:text-blue-300'
      }`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  )
}

export function MenuSeparator() {
  return <div className="my-1 border-t border-blue-500/[0.06]" />
}
