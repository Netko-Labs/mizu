import type { Node } from '@xyflow/react'
import type { NodeSize } from './types'

export function getNodeSize(node: Node): NodeSize {
  const style = node.style as Record<string, unknown> | undefined
  const styleWidth = style?.width
  const styleHeight = style?.height

  const width =
    typeof node.width === 'number'
      ? node.width
      : typeof styleWidth === 'number'
        ? styleWidth
        : undefined
  const height =
    typeof node.height === 'number'
      ? node.height
      : typeof styleHeight === 'number'
        ? styleHeight
        : undefined

  return { width, height }
}
