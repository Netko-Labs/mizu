import { useState } from 'react'
import type { ProjectDrawerTab } from '@/components/canvas/project-drawer'
import type { DrawerTab } from '@/components/canvas/service-drawer'

/** Overlay/panel visibility + node selection — local, ephemeral view state. */
export function useCanvasOverlays() {
  const [addOpen, setAddOpen] = useState(false)
  const [deployOpen, setDeployOpen] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  // Which drawer tab to open the selection on (null = default Overview).
  const [drawerTab, setDrawerTab] = useState<DrawerTab | null>(null)
  // The project config panel's tab; null = closed. Mutually exclusive with the
  // service drawer (both live on the right edge).
  const [projectTab, setProjectTab] = useState<ProjectDrawerTab | null>(null)

  return {
    addOpen,
    setAddOpen,
    deployOpen,
    setDeployOpen,
    selectedNodeId,
    setSelectedNodeId,
    drawerTab,
    setDrawerTab,
    projectTab,
    setProjectTab,
  }
}
