import type { Network } from '@mizu/nagare-domain'
import type { ComposeNetwork } from '../types'

/**
 * Transform a Mizu network to a Docker Compose network definition.
 */
export function transformNetwork(network: Network): ComposeNetwork {
  const composeNetwork: ComposeNetwork = {}

  // Driver
  if (network.driver && network.driver !== 'bridge') {
    composeNetwork.driver = network.driver
  }

  // IPAM configuration
  if (network.subnet || network.gateway) {
    composeNetwork.ipam = {
      config: [
        {
          ...(network.subnet && { subnet: network.subnet }),
          ...(network.gateway && { gateway: network.gateway }),
        },
      ],
    }
  }

  // Internal network flag
  if (network.internal) {
    composeNetwork.internal = true
  }

  return composeNetwork
}

/**
 * Transform multiple networks to Docker Compose network definitions.
 */
export function transformNetworks(networks: Network[]): Record<string, ComposeNetwork> {
  const result: Record<string, ComposeNetwork> = {}

  for (const network of networks) {
    result[network.name] = transformNetwork(network)
  }

  return result
}
