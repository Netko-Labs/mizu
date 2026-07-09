import type { ReactFlowInstance } from '@xyflow/react'
import { type DragEvent, useCallback, useRef } from 'react'
import type { UseCanvasDndParams } from '../types'

export function useCanvasDnd({ onAddService, onAddDatabase }: UseCanvasDndParams) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null)

  // Handle ReactFlow initialization
  const handleInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance
  }, [])

  // Handle drag over to allow drop
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  // Handle drop from sidebar
  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()

      const type = e.dataTransfer.getData('application/reactflow-type')
      const dataStr = e.dataTransfer.getData('application/reactflow-data')

      if (!type || !dataStr) {
        return
      }

      const dropData = JSON.parse(dataStr)

      if (type === 'service' && onAddService) {
        const sourceType = dropData.sourceType || 'image'
        let sourceConfig: Record<string, unknown>
        if (sourceType === 'template') {
          sourceConfig = {
            templateId: dropData.templateId || 'custom',
            overrides: {},
            // biome-ignore lint/style/useNamingConvention: underscore marks a transient client-side flag stripped before the API call
            _createAsGroup: dropData.createAsGroup === true,
          }
        } else if (sourceType === 'git') {
          sourceConfig = { repository: 'https://github.com/example/repo' }
        } else {
          sourceConfig = { image: 'nginx', tag: 'latest' }
        }
        onAddService({
          name: dropData.name || 'New Service',
          sourceType,
          sourceConfig,
        })
      } else if (type === 'database' && onAddDatabase) {
        onAddDatabase({
          name: dropData.name || 'New Database',
          type: dropData.databaseType || 'postgres',
          version: dropData.version,
        })
      }
      // Volume, network, secret, external types don't have backend mutations yet
    },
    [onAddService, onAddDatabase],
  )

  return { reactFlowWrapper, handleInit, handleDragOver, handleDrop }
}
