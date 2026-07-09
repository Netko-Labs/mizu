/**
 * System service for Mizu
 * Handles system-level operations like initialization, stats, and health checks.
 */

import { cpus, freemem, hostname, loadavg, platform, release, totalmem, uptime } from 'node:os'
import { createLogger } from '@mizu/logger'
import { getDockerInfo, isDockerAvailable } from '../docker'
import { ensureDir, exists, getMizuHome, getWorkspacesPath } from '../filesystem'

const logger = createLogger('system')

/**
 * Initialize Mizu system directories.
 * Creates ~/.mizu and subdirectories if they don't exist.
 */
export async function initializeMizu(): Promise<{
  initialized: boolean
  mizuHome: string
  created: string[]
}> {
  const mizuHome = getMizuHome()
  const workspacesPath = getWorkspacesPath()
  const created: string[] = []

  logger.info({ mizuHome }, 'Initializing Mizu directories')

  // Check and create ~/.mizu
  if (!(await exists(mizuHome))) {
    await ensureDir(mizuHome)
    created.push(mizuHome)
    logger.info({ path: mizuHome }, 'Created Mizu home directory')
  }

  // Check and create ~/.mizu/workspaces
  if (!(await exists(workspacesPath))) {
    await ensureDir(workspacesPath)
    created.push(workspacesPath)
    logger.info({ path: workspacesPath }, 'Created workspaces directory')
  }

  return {
    initialized: true,
    mizuHome,
    created,
  }
}

/**
 * Get system information for the host machine.
 */
export async function getSystemInfo(): Promise<{
  hostname: string
  platform: string
  release: string
  arch: string
  uptime: number
  uptimeFormatted: string
}> {
  const uptimeSeconds = uptime()

  return {
    hostname: hostname(),
    platform: platform(),
    release: release(),
    arch: process.arch,
    uptime: uptimeSeconds,
    uptimeFormatted: formatUptime(uptimeSeconds),
  }
}

/**
 * Get memory statistics.
 */
export function getMemoryStats(): {
  total: number
  free: number
  used: number
  usedPercent: number
} {
  const total = totalmem()
  const free = freemem()
  const used = total - free
  const usedPercent = Math.round((used / total) * 100)

  return {
    total,
    free,
    used,
    usedPercent,
  }
}

/**
 * Get CPU statistics.
 */
export function getCpuStats(): {
  cores: number
  model: string
  speed: number
  loadAverage: number[]
} {
  const cpuInfo = cpus()

  return {
    cores: cpuInfo.length,
    model: cpuInfo[0]?.model ?? 'Unknown',
    speed: cpuInfo[0]?.speed ?? 0,
    loadAverage: loadavg(),
  }
}

/**
 * Get Mizu status including all subsystems.
 */
export async function getMizuStatus(): Promise<{
  mizuHome: string
  mizuHomeExists: boolean
  dockerAvailable: boolean
  dockerInfo: Awaited<ReturnType<typeof getDockerInfo>> | null
}> {
  const mizuHome = getMizuHome()
  const mizuHomeExists = await exists(mizuHome)
  const dockerAvailable = await isDockerAvailable()

  let dockerInfo = null
  if (dockerAvailable) {
    try {
      dockerInfo = await getDockerInfo()
    } catch {
      // Docker info fetch failed, but Docker is available
    }
  }

  return {
    mizuHome,
    mizuHomeExists,
    dockerAvailable,
    dockerInfo,
  }
}

/**
 * Get comprehensive dashboard stats.
 */
export async function getDashboardStats(): Promise<{
  system: Awaited<ReturnType<typeof getSystemInfo>>
  memory: ReturnType<typeof getMemoryStats>
  cpu: ReturnType<typeof getCpuStats>
  mizu: Awaited<ReturnType<typeof getMizuStatus>>
}> {
  const [system, mizu] = await Promise.all([getSystemInfo(), getMizuStatus()])

  return {
    system,
    memory: getMemoryStats(),
    cpu: getCpuStats(),
    mizu,
  }
}

/**
 * Format uptime in human-readable format.
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)

  return parts.length > 0 ? parts.join(' ') : '< 1m'
}
