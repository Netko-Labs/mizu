/**
 * Response shapes for the system routes. Owned by domain so the frontend can
 * type responses without importing server code (eden@1.4 infers these complex
 * objects as `{}` under Elysia 2, so the api layer casts against these).
 */

export interface RuntimeInfo {
  version: string
  containers: number
  containersRunning: number
  images: number
}

export interface SystemInfo {
  hostname: string
  platform: string
  release: string
  arch: string
  uptime: number
  uptimeFormatted: string
}

export interface MemoryStats {
  total: number
  free: number
  used: number
  usedPercent: number
}

export interface CpuStats {
  cores: number
  model: string
  speed: number
  loadAverage: number[]
}

export interface TailscaleInfo {
  dnsName: string
  ip: string
}

export interface MizuStatus {
  mizuHome: string
  mizuHomeExists: boolean
  runtimeAvailable: boolean
  runtimeInfo: RuntimeInfo | null
  tailscale: TailscaleInfo | null
}

export interface DashboardStats {
  system: SystemInfo
  memory: MemoryStats
  cpu: CpuStats
  mizu: MizuStatus
}

export interface InitializeResult {
  initialized: boolean
  mizuHome: string
  created: string[]
}
