import { useEffect, useState } from 'react'

/**
 * True only after the first client render. Used to gate SSR-unsafe widgets
 * (like the WASM-backed terminal) so they render browser-side only.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}
