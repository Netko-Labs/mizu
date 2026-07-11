/**
 * Desired ingress state: every RUNNING service with a port gets a route
 * `{service}.{project}.{baseDomain}` → its container's CURRENT IP (Apple
 * container has no name DNS, so upstreams are IPs — the supervisor re-syncs
 * every pass, healing IP drift within seconds). Databases are never proxied.
 */

import { instanceSettingTable, projectTable, serviceTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { listContainers, sanitizeName } from '../runtime'
import { DEFAULT_BASE_DOMAIN, INGRESS_ADMIN_PORT, INGRESS_HTTP_PORT } from './constants'
import type { CaddyConfig, CaddyRoute } from './types'

/** The public host a deployed service is served on */
export function serviceIngressHost(
  serviceName: string,
  projectSlug: string,
  baseDomain: string,
): string {
  return `${sanitizeName(serviceName)}.${sanitizeName(projectSlug)}.${baseDomain}`
}

/** Base domain from instance settings, defaulting to *.localhost */
export async function getIngressBaseDomain(): Promise<string> {
  const [settings] = await db.select().from(instanceSettingTable).limit(1)
  return settings?.domain || DEFAULT_BASE_DOMAIN
}

/**
 * Build the full desired Caddy config from the database + live container IPs.
 */
export async function buildIngressConfig(): Promise<CaddyConfig> {
  const [baseDomain, containers] = await Promise.all([getIngressBaseDomain(), listContainers()])
  const ipByContainer = new Map(
    containers
      .filter((c) => c.running && c.ipv4Address)
      .map((c) => [c.id, c.ipv4Address as string]),
  )

  const services = await db
    .select({
      name: serviceTable.name,
      status: serviceTable.status,
      ports: serviceTable.ports,
      containerId: serviceTable.containerId,
      projectSlug: projectTable.slug,
    })
    .from(serviceTable)
    .innerJoin(projectTable, eq(serviceTable.projectId, projectTable.id))

  const routes: CaddyRoute[] = []
  for (const service of services) {
    if (service.status !== 'running' || !service.projectSlug || !service.containerId) continue
    const ports = (service.ports as Array<{ container?: number }> | null) ?? []
    const containerPort = ports[0]?.container
    if (!containerPort) continue
    const upstreamIp = ipByContainer.get(service.containerId)
    if (!upstreamIp) continue

    routes.push({
      match: [{ host: [serviceIngressHost(service.name, service.projectSlug, baseDomain)] }],
      handle: [
        {
          handler: 'reverse_proxy',
          upstreams: [{ dial: `${upstreamIp}:${containerPort}` }],
        },
      ],
    })
  }

  return {
    admin: { listen: `0.0.0.0:${INGRESS_ADMIN_PORT}` },
    apps: {
      http: {
        servers: {
          mizu: {
            listen: [`:${INGRESS_HTTP_PORT}`],
            routes,
          },
        },
      },
    },
  }
}
