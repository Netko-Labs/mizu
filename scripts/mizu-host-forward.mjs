#!/usr/bin/env node
/**
 * mizu host port-forwarder — workaround for Apple `container` published-port
 * forwarding being broken on macOS 26.1+ (apple/container#919: the container
 * helper accepts host connections but can't reach the container over vmnet,
 * because its ad-hoc-signed launchd helper can't hold macOS Local Network
 * permission).
 *
 * Direct host→container-IP traffic works fine, and a normal `node` process
 * *is* granted Local Network access — so this bridges the standard host ports
 * to the live container IPs, resolving them dynamically so it survives
 * container restarts (IPs change).
 *
 * Only needed on affected boxes; nagare/infra skip `--publish` when
 * MIZU_HOST_FORWARD=1 so these ports are free for us to bind. Run as root
 * (binds :80/:443).
 */
import { execFile } from 'node:child_process'
import net from 'node:net'
import { promisify } from 'node:util'

const run = promisify(execFile)

const CONTAINER_BIN = process.env.CONTAINER_BIN ?? '/opt/homebrew/bin/container'

// host listen -> container backend
const MAP = [
  { lhost: '127.0.0.1', lport: 19432, cname: 'mizu-db-minato', cport: 5432 },
  { lhost: '127.0.0.1', lport: 2019, cname: 'mizu-ingress', cport: 2019 },
  { lhost: '0.0.0.0', lport: 80, cname: 'mizu-ingress', cport: 80 },
  { lhost: '0.0.0.0', lport: 443, cname: 'mizu-ingress', cport: 443 },
]

/** name -> current IPv4 address (no CIDR suffix), refreshed periodically */
const ipByName = new Map()

async function resolveIp(name) {
  try {
    const { stdout } = await run(CONTAINER_BIN, ['inspect', name], { timeout: 8000 })
    const data = JSON.parse(stdout)
    const addr = data?.[0]?.networks?.[0]?.address ?? ''
    return addr.split('/')[0] || null
  } catch {
    return null
  }
}

async function refresh() {
  const names = [...new Set(MAP.map((m) => m.cname))]
  await Promise.all(
    names.map(async (n) => {
      const ip = await resolveIp(n)
      if (ip) ipByName.set(n, ip)
    }),
  )
}

function serve({ lhost, lport, cname, cport }) {
  const server = net.createServer((client) => {
    const ip = ipByName.get(cname)
    if (!ip) {
      client.destroy()
      return
    }
    const backend = net.connect(cport, ip)
    client.pipe(backend)
    backend.pipe(client)
    const kill = () => {
      client.destroy()
      backend.destroy()
    }
    client.on('error', kill)
    backend.on('error', kill)
  })
  server.on('error', (err) => {
    console.error(`[mizu-fwd] listen ${lhost}:${lport} failed:`, err.message)
  })
  server.listen(lport, lhost, () => {
    console.log(`[mizu-fwd] ${lhost}:${lport} -> ${cname}:${cport}`)
  })
}

await refresh()
setInterval(refresh, 5000)
for (const entry of MAP) serve(entry)
console.log('[mizu-fwd] running')
