import type { DashboardStats } from '@mizu/nagare-domain'
import {
  CPU_MODEL_MAX_LENGTH,
  METER_ALERT_PERCENT,
  METER_SEGMENTS,
  METER_WARN_PERCENT,
} from './constants'
import type { HostBand, MeterTile, RuntimeLine } from './types'

export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let unitIndex = 0
  let value = bytes
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex++
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'good morning'
  if (hour < 18) return 'good afternoon'
  return 'good evening'
}

export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)))
}

/** 1-minute load average expressed as a percent of available cores. */
export function loadPercent(load1: number, cores: number): number {
  if (cores <= 0) return 0
  return clampPercent((load1 / cores) * 100)
}

/** Split a percent into filled/empty Unicode block runs (`▰▰▰▱▱▱▱▱`). */
export function meterBlocks(percent: number): { filled: string; empty: string } {
  const filledCount = Math.round((clampPercent(percent) / 100) * METER_SEGMENTS)
  return {
    filled: '▰'.repeat(filledCount),
    empty: '▱'.repeat(METER_SEGMENTS - filledCount),
  }
}

/** Meter tint: blue below warn, amber to alert, red above. */
export function meterToneClass(percent: number): string {
  if (percent > METER_ALERT_PERCENT) return 'text-red-400'
  if (percent >= METER_WARN_PERCENT) return 'text-amber-400'
  return 'text-blue-500'
}

export function truncateText(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

export function buildHostBand(stats: DashboardStats): HostBand {
  const { system, mizu } = stats
  return {
    hostname: system.hostname,
    osLine: `${system.platform} ${system.arch} · up ${system.uptimeFormatted}`,
    runtimeAvailable: mizu.runtimeAvailable,
    tailnetDnsName: mizu.tailscale?.dnsName ?? null,
  }
}

export function buildMeterTiles(stats: DashboardStats): MeterTile[] {
  const { cpu, memory, mizu } = stats
  const cpuPercent = loadPercent(cpu.loadAverage[0] ?? 0, cpu.cores)
  const memPercent = clampPercent(memory.usedPercent)
  const runtime = mizu.runtimeAvailable ? mizu.runtimeInfo : null
  const running = runtime?.containersRunning ?? 0
  const total = runtime?.containers ?? 0

  return [
    {
      id: 'cpu',
      label: 'cpu.load',
      value: `${cpuPercent}%`,
      percent: cpuPercent,
      toneClass: meterToneClass(cpuPercent),
      sub: `${cpu.cores} cores · ${truncateText(cpu.model, CPU_MODEL_MAX_LENGTH)}`,
    },
    {
      id: 'memory',
      label: 'mem.used',
      value: `${memPercent}%`,
      percent: memPercent,
      toneClass: meterToneClass(memPercent),
      sub: `${formatBytes(memory.used)} / ${formatBytes(memory.total)}`,
    },
    {
      id: 'containers',
      label: 'containers.running',
      value: runtime ? `${running}/${total}` : '—',
      percent: total > 0 ? clampPercent((running / total) * 100) : 0,
      toneClass: 'text-blue-500',
      sub: runtime ? `${runtime.images} images` : 'runtime offline',
    },
  ]
}

export function buildRuntimeLines(stats: DashboardStats): RuntimeLine[] {
  const { system, mizu } = stats
  return [
    {
      label: 'runtime',
      value: mizu.runtimeAvailable ? (mizu.runtimeInfo?.version ?? 'unknown') : 'offline',
      accent: mizu.runtimeAvailable,
    },
    { label: 'images', value: String(mizu.runtimeInfo?.images ?? 0) },
    { label: 'mizu_home', value: mizu.mizuHome },
    { label: 'os_release', value: `${system.platform} ${system.release}` },
  ]
}
