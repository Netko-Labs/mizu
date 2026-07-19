import { useEffect, useState } from 'react'
import type { DrawerTab, UseServiceDrawerOptions, UseServiceDrawerResult } from '../types'

/**
 * Active-tab state: follows an external `initialTab` request (e.g. a node's
 * "View logs" opening the drawer on Logs) and resets to Overview whenever the
 * selected node changes.
 */
export function useServiceDrawer({
  nodeId,
  initialTab,
}: UseServiceDrawerOptions): UseServiceDrawerResult {
  const [tab, setTab] = useState<DrawerTab>(initialTab ?? 'overview')

  // biome-ignore lint/correctness/useExhaustiveDependencies: nodeId is intentionally a reset trigger
  useEffect(() => {
    setTab(initialTab ?? 'overview')
  }, [nodeId, initialTab])

  return { tab, setTab }
}
