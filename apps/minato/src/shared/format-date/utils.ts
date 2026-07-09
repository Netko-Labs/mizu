function toDate(date: Date | string): Date {
  return typeof date === 'string' ? new Date(date) : date
}

/** "just now", "5m ago", "3h ago", "2d ago", else a local date string. */
export function formatRelativeTime(date: Date | string): string {
  const then = toDate(date)
  const seconds = Math.floor((Date.now() - then.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return then.toLocaleDateString()
}

/** Locale date + time, tolerant of ISO strings off the wire. */
export function formatDateTime(date: Date | string): string {
  return toDate(date).toLocaleString()
}
