import type { EdgeTypes, NodeTypes } from '@xyflow/react'
import { ConnectionEdge } from '@/components/canvas/edges/connection-edge'
import { DatabaseNode } from '@/components/canvas/nodes/database-node'
import { ExternalServiceNode } from '@/components/canvas/nodes/external-service-node'
import { NetworkNode } from '@/components/canvas/nodes/network-node'
import { SecretNode } from '@/components/canvas/nodes/secret-node'
import { ServiceGroupNode } from '@/components/canvas/nodes/service-group-node'
import { ServiceNode } from '@/components/canvas/nodes/service-node'
import { VolumeNode } from '@/components/canvas/nodes/volume-node'

export const nodeTypes: NodeTypes = {
  'service-group': ServiceGroupNode,
  service: ServiceNode,
  database: DatabaseNode,
  volume: VolumeNode,
  network: NetworkNode,
  secret: SecretNode,
  external: ExternalServiceNode,
}

export const edgeTypes: EdgeTypes = {
  connection: ConnectionEdge,
}

/** Default edge options for new connections */
export const defaultEdgeOptions = {
  type: 'connection',
  animated: false,
}
