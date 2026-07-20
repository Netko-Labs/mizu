import { useState } from 'react'
import type { DrawerTab } from '@/components/canvas/service-drawer'

/** Overlay/panel visibility + node selection — local, ephemeral view state. */
export function useCanvasOverlays() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [yamlOpen, setYamlOpen] = useState(false)
  const [deployOpen, setDeployOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [activityOpen, setActivityOpen] = useState(false)
  // Which drawer tab to open the selection on (null = default Overview).
  const [drawerTab, setDrawerTab] = useState<DrawerTab | null>(null)

  return {
    sidebarOpen,
    setSidebarOpen,
    yamlOpen,
    setYamlOpen,
    deployOpen,
    setDeployOpen,
    settingsOpen,
    setSettingsOpen,
    selectedNodeId,
    setSelectedNodeId,
    activityOpen,
    setActivityOpen,
    drawerTab,
    setDrawerTab,
  }
}
