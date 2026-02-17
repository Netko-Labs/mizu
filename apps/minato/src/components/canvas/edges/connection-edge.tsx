import type { ConnectionType } from '@mizu/minato-domain'
import {
  BaseEdge,
  type Edge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
} from '@xyflow/react'
import { cn } from '@/lib/utils'

export interface ConnectionEdgeData {
  connectionType: ConnectionType
  envVarName?: string
  isNetworkEdge?: boolean
  [key: string]: unknown
}

export type ConnectionEdgeType = Edge<ConnectionEdgeData, 'connection'>

const edgeStyles: Record<
  ConnectionType,
  {
    stroke: string
    strokeDasharray?: string
    strokeWidth: number
    markerEnd?: string
  }
> = {
  depends: {
    stroke: 'rgba(59,130,246,0.3)',
    strokeWidth: 2,
    markerEnd: 'url(#arrowhead-depends)',
  },
  connects: {
    stroke: 'rgba(59,130,246,0.15)',
    strokeDasharray: '6,4',
    strokeWidth: 1.5,
  },
  mounts: {
    stroke: 'rgba(59,130,246,0.1)',
    strokeDasharray: '2,4',
    strokeWidth: 1.5,
  },
  uses: {
    stroke: 'rgba(59,130,246,0.1)',
    strokeDasharray: '4,4',
    strokeWidth: 1.5,
  },
}

const connectionLabels: Record<ConnectionType, string> = {
  depends: 'depends on',
  connects: 'connects to',
  mounts: 'mounts',
  uses: 'uses',
}

export function ConnectionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps<ConnectionEdgeType>) {
  const connectionType = data?.connectionType ?? 'connects'
  const isNetworkEdge = data?.isNetworkEdge ?? false
  const style = edgeStyles[connectionType]

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  // Network edges are subtler than explicit connections but still visible
  const strokeColor = isNetworkEdge
    ? 'rgba(59,130,246,0.18)'
    : selected
      ? 'rgba(59,130,246,0.5)'
      : style.stroke
  const strokeWidth = isNetworkEdge
    ? 1.5
    : selected
      ? style.strokeWidth + 0.5
      : style.strokeWidth

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray: isNetworkEdge ? '4,4' : style.strokeDasharray,
        }}
        markerEnd={connectionType === 'depends' && !isNetworkEdge ? style.markerEnd : markerEnd}
        className="transition-all"
      />

      {/* Edge label — hide for network edges */}
      {!isNetworkEdge && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div
              className={cn(
                'rounded-md border border-blue-500/[0.06] bg-black px-2 py-0.5 text-[10px] text-neutral-500 shadow-sm transition-opacity',
                selected ? 'opacity-100' : 'opacity-60 hover:opacity-100',
              )}
            >
              {data?.envVarName ? (
                <span className="font-mono">{data.envVarName}</span>
              ) : (
                connectionLabels[connectionType]
              )}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

/**
 * SVG marker definitions component to be rendered once at the canvas level.
 * This ensures markers are available for all edges.
 */
export function ConnectionEdgeMarkers() {
  return (
    <svg
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
        overflow: 'hidden',
      }}
    >
      <defs>
        {/* Arrow marker for 'depends' edges */}
        <marker
          id="arrowhead-depends"
          markerWidth="12"
          markerHeight="12"
          refX="10"
          refY="6"
          orient="auto"
        >
          <path d="M2,2 L10,6 L2,10 L4,6 Z" fill="rgba(59,130,246,0.3)" />
        </marker>

        {/* Circle marker for 'connects' edges (optional) */}
        <marker
          id="circle-connects"
          markerWidth="8"
          markerHeight="8"
          refX="4"
          refY="4"
          orient="auto"
        >
          <circle cx="4" cy="4" r="3" fill="rgba(59,130,246,0.15)" />
        </marker>

        {/* Square marker for 'mounts' edges (optional) */}
        <marker id="square-mounts" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <rect x="1" y="1" width="6" height="6" fill="rgba(59,130,246,0.15)" />
        </marker>
      </defs>
    </svg>
  )
}
