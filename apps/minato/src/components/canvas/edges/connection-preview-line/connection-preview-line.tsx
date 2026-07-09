import {
  type ConnectionLineComponentProps,
  getBezierPath,
  type Node,
  Position,
} from '@xyflow/react'

export function ConnectionPreviewLine({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
  connectionStatus,
}: ConnectionLineComponentProps<Node>) {
  const projectFromPoint = (x: number, y: number, position: Position, distance: number) => {
    if (position === Position.Right) return { x: x + distance, y }
    if (position === Position.Left) return { x: x - distance, y }
    if (position === Position.Top) return { x, y: y - distance }
    if (position === Position.Bottom) return { x, y: y + distance }
    return { x, y }
  }

  const adjustedFrom = projectFromPoint(fromX, fromY, fromPosition, 10)
  const adjustedTo = { x: toX, y: toY }

  const [path] = getBezierPath({
    sourceX: adjustedFrom.x,
    sourceY: adjustedFrom.y,
    sourcePosition: fromPosition,
    targetX: adjustedTo.x,
    targetY: adjustedTo.y,
    targetPosition: toPosition,
  })

  const isInvalid = connectionStatus === 'invalid'
  const stroke = isInvalid ? 'rgba(239,68,68,0.9)' : 'rgba(59,130,246,0.8)'
  const glow = isInvalid ? 'rgba(239,68,68,0.35)' : 'rgba(59,130,246,0.35)'
  const markerFill = isInvalid ? 'rgba(239,68,68,0.9)' : 'rgba(59,130,246,0.95)'

  const marker = (x: number, y: number, key: string) => (
    <g key={key}>
      <circle cx={x} cy={y} r={8} fill={markerFill} fillOpacity={0.24} />
      <circle
        cx={x}
        cy={y}
        r={5}
        fill={markerFill}
        stroke="rgba(255,255,255,0.95)"
        strokeWidth={1.5}
      />
      <circle cx={x} cy={y} r={1.8} fill="rgba(255,255,255,0.95)" />
    </g>
  )

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={2.5}
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 6px ${glow})`,
        }}
      />
      {marker(adjustedTo.x, adjustedTo.y, 'to')}
    </g>
  )
}
