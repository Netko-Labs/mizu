export interface CanvasViewProps {
  projectId: string
  projectName: string
}

export interface LogsTarget {
  nodeId: string
  nodeType: 'service' | 'database'
}
