/**
 * Instance identity for ingress + dashboards: how this mizu box is reachable.
 * Detects Tailscale (when installed) so tailnet devices get a working URL.
 */

import { createLogger } from '@mizu/logger'

const logger = createLogger('ingress:identity')

const TAILSCALE_BINS = [
  'tailscale',
  '/Applications/Tailscale.app/Contents/MacOS/Tailscale',
  '/usr/local/bin/tailscale',
]

export interface TailscaleIdentity {
  /** MagicDNS name of this node (e.g. bakeneko.tail1234.ts.net) */
  dnsName: string
  /** Tailnet IP (100.x.y.z) */
  ip: string
}

let cached: { value: TailscaleIdentity | null; at: number } | null = null
const CACHE_MS = 60_000

/** Tailnet identity of this machine, or null when Tailscale isn't running. */
export async function getTailscaleIdentity(): Promise<TailscaleIdentity | null> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.value

  for (const bin of TAILSCALE_BINS) {
    if (bin !== 'tailscale' || Bun.which(bin)) {
      try {
        const proc = Bun.spawn([bin, 'status', '--json'], { stdout: 'pipe', stderr: 'ignore' })
        const [output, exitCode] = await Promise.all([
          new Response(proc.stdout).text(),
          proc.exited,
        ])
        if (exitCode !== 0) continue
        const status = JSON.parse(output) as {
          BackendState?: string
          Self?: { DNSName?: string; TailscaleIPs?: string[] }
        }
        if (status.BackendState !== 'Running' || !status.Self?.DNSName) continue
        const identity = {
          dnsName: status.Self.DNSName.replace(/\.$/, ''),
          ip: status.Self.TailscaleIPs?.[0] ?? '',
        }
        cached = { value: identity, at: Date.now() }
        return identity
      } catch (error) {
        logger.debug({ bin, error: String(error) }, 'tailscale probe failed')
      }
    }
  }

  cached = { value: null, at: Date.now() }
  return null
}
