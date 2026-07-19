import { runtimeCli } from './cli'

/**
 * Per-container resource sampling. Apple's `container` CLI (as of 1.1.0) has
 * no stats command, so the primary path reads /proc inside the container —
 * each Apple container is a lightweight VM with its own kernel, so its
 * aggregate /proc/stat + /proc/meminfo ARE per-container truth.
 */

export interface ProcSample {
  /** Aggregate cpu jiffies: total across all fields. */
  cpuTotal: number
  /** Aggregate idle jiffies (idle + iowait). */
  cpuIdle: number
  memTotalKb: number
  memAvailableKb: number
}

let statsCommandSupport: boolean | null = null

/** Probe `container stats --help` once — a fast-path if a future CLI adds it. */
export async function supportsStatsCommand(): Promise<boolean> {
  if (statsCommandSupport !== null) return statsCommandSupport
  try {
    await runtimeCli(['stats', '--help'], { timeoutMs: 5_000 })
    statsCommandSupport = true
  } catch {
    statsCommandSupport = false
  }
  return statsCommandSupport
}

/**
 * Read one raw /proc sample from a running container. Throws on exec failure
 * (e.g. distroless images without `cat`) — callers degrade that service to
 * "no metrics".
 */
export async function readContainerProcSample(containerId: string): Promise<ProcSample> {
  const result = await runtimeCli(['exec', containerId, 'cat', '/proc/stat', '/proc/meminfo'], {
    timeoutMs: 5_000,
  })
  return parseProcSample(result.stdout)
}

/** Parse concatenated /proc/stat + /proc/meminfo output. */
export function parseProcSample(output: string): ProcSample {
  let cpuTotal = 0
  let cpuIdle = 0
  let memTotalKb = 0
  let memAvailableKb = 0

  for (const line of output.split('\n')) {
    if (line.startsWith('cpu ')) {
      // cpu user nice system idle iowait irq softirq steal guest guest_nice
      const fields = line.slice(4).trim().split(/\s+/).map(Number)
      cpuTotal = fields.reduce((sum, n) => sum + (Number.isFinite(n) ? n : 0), 0)
      cpuIdle = (fields[3] ?? 0) + (fields[4] ?? 0)
    } else if (line.startsWith('MemTotal:')) {
      memTotalKb = Number.parseInt(line.split(/\s+/)[1] ?? '0', 10)
    } else if (line.startsWith('MemAvailable:')) {
      memAvailableKb = Number.parseInt(line.split(/\s+/)[1] ?? '0', 10)
    }
  }

  return { cpuTotal, cpuIdle, memTotalKb, memAvailableKb }
}
