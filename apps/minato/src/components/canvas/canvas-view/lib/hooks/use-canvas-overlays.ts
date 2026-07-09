import { useState } from 'react'
import type { LogsTarget } from '../types'

/** Overlay/panel visibility + node selection — local, ephemeral view state. */
export function useCanvasOverlays() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [yamlOpen, setYamlOpen] = useState(false)
  const [deployOpen, setDeployOpen] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [logsTarget, setLogsTarget] = useState<LogsTarget | null>(null)

  return {
    sidebarOpen,
    setSidebarOpen,
    yamlOpen,
    setYamlOpen,
    deployOpen,
    setDeployOpen,
    selectedNodeId,
    setSelectedNodeId,
    logsTarget,
    setLogsTarget,
  }
}
