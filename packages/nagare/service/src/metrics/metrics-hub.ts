import { createLogger } from '@mizu/logger'
import { type ServiceMetricsSample, serviceTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { and, eq, isNotNull } from 'drizzle-orm'
import { readContainerProcSample } from '../runtime'
import {
  METRICS_INTERVAL_MS,
  METRICS_RETENTION_SAMPLES,
  METRICS_SAMPLE_CONCURRENCY,
} from './constants'
import type { MetricsEntry, MetricsSamplerHandle } from './types'

const logger = createLogger('metrics')

/**
 * In-memory metrics store: ~1h of CPU/mem samples per running service. No DB
 * table — homelab scale, history is disposable on daemon restart (the API
 * reports what it has). Mirrors the supervisor's self-scheduling timer so
 * slow exec probes never stall crash-healing.
 */
const entries = new Map<string, MetricsEntry>()

function entryFor(serviceId: string): MetricsEntry {
  let entry = entries.get(serviceId)
  if (!entry) {
    entry = { samples: [], prev: null, unsupported: false }
    entries.set(serviceId, entry)
  }
  return entry
}

async function sampleService(serviceId: string, containerId: string): Promise<void> {
  const entry = entryFor(serviceId)
  if (entry.unsupported) return
  try {
    const raw = await readContainerProcSample(containerId)
    if (entry.prev) {
      const totalDelta = raw.cpuTotal - entry.prev.cpuTotal
      const idleDelta = raw.cpuIdle - entry.prev.cpuIdle
      // Container restarted between reads → jiffies reset; skip this delta.
      if (totalDelta > 0 && idleDelta >= 0 && idleDelta <= totalDelta) {
        const sample: ServiceMetricsSample = {
          t: Date.now(),
          cpuPercent: Math.round(((totalDelta - idleDelta) / totalDelta) * 1000) / 10,
          memUsedMb: Math.round((raw.memTotalKb - raw.memAvailableKb) / 1024),
          memTotalMb: Math.round(raw.memTotalKb / 1024),
        }
        entry.samples.push(sample)
        if (entry.samples.length > METRICS_RETENTION_SAMPLES) {
          entry.samples.splice(0, entry.samples.length - METRICS_RETENTION_SAMPLES)
        }
      }
    }
    entry.prev = raw
  } catch {
    // Image can't be sampled (no cat / exec denied) — degrade, log once.
    entry.unsupported = true
    logger.warn({ serviceId }, 'Container image does not support /proc sampling — no metrics')
  }
}

async function samplePass(): Promise<void> {
  const running = await db
    .select({ id: serviceTable.id, containerId: serviceTable.containerId })
    .from(serviceTable)
    .where(and(eq(serviceTable.status, 'running'), isNotNull(serviceTable.containerId)))

  // Evict services that are gone / no longer running.
  const runningIds = new Set(running.map((s) => s.id))
  for (const id of entries.keys()) {
    if (!runningIds.has(id)) entries.delete(id)
  }

  // Bounded concurrency without extra deps: chunked passes.
  for (let i = 0; i < running.length; i += METRICS_SAMPLE_CONCURRENCY) {
    await Promise.all(
      running
        .slice(i, i + METRICS_SAMPLE_CONCURRENCY)
        .map((s) => sampleService(s.id, s.containerId as string)),
    )
  }
}

/** Samples for one service — `available` false when nothing can be reported. */
export function getServiceSamples(serviceId: string): {
  available: boolean
  intervalMs: number
  samples: ServiceMetricsSample[]
} {
  const entry = entries.get(serviceId)
  return {
    available: Boolean(entry && !entry.unsupported),
    intervalMs: METRICS_INTERVAL_MS,
    samples: entry?.samples ?? [],
  }
}

/** Start the sampling loop (mirrors the supervisor's timer shape). */
export function startMetricsSampler(): MetricsSamplerHandle {
  let stopping = false
  let timer: ReturnType<typeof setTimeout> | null = null
  let inFlight: Promise<void> = Promise.resolve()

  const schedule = () => {
    if (stopping) return
    timer = setTimeout(() => {
      inFlight = samplePass()
        .catch((error) => {
          logger.error({ error: String(error) }, 'Metrics pass failed')
        })
        .finally(schedule)
    }, METRICS_INTERVAL_MS)
  }

  logger.info({ intervalMs: METRICS_INTERVAL_MS }, '📈 metrics sampler flowing')
  schedule()

  return {
    async stop() {
      stopping = true
      if (timer) clearTimeout(timer)
      await inFlight
      logger.info('metrics sampler stopped')
    },
  }
}
