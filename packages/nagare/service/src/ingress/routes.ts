/**
 * Desired ingress state: every RUNNING service with a port gets a route
 * `{service}.{project}.{baseDomain}` → its container's CURRENT IP (Apple
 * container has no name DNS, so upstreams are IPs — the supervisor re-syncs
 * every pass, healing IP drift within seconds). Databases are never proxied.
 */

import { nagareEnvConfig } from '@mizu/nagare-config'
import {
  environmentTable,
  instanceSettingTable,
  type ProjectSettings,
  projectTable,
  type ServiceSettings,
  serviceTable,
} from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { deployNamespace, listContainers, sanitizeName } from '../runtime'
import {
  DEFAULT_BASE_DOMAIN,
  INGRESS_ADMIN_PORT,
  INGRESS_CONTAINER,
  INGRESS_HTTP_PORT,
} from './constants'
import { getTailscaleIdentity } from './identity'
import type { CaddyConfig, CaddyRoute } from './types'

/**
 * The public host a deployed service is served on. `namespace` is the
 * project+environment deploy namespace, so the default environment stays
 * `{service}-{project}.{domain}` and others become `{service}-{project}-{env}`.
 */
export function serviceIngressHost(
  serviceName: string,
  namespace: string,
  baseDomain: string,
): string {
  // Single label so one wildcard cert (*.domain) covers every app
  return `${sanitizeName(serviceName)}-${sanitizeName(namespace)}.${baseDomain}`
}

/**
 * The public host of a manual ingress rule. A `subdomain` rule is a label
 * under the instance base domain (covered by the `*.domain` wildcard cert); a
 * `custom` rule is a full FQDN used verbatim (its own ACME cert).
 */
export function manualIngressHost(
  rule: { hostType: 'subdomain' | 'custom'; host: string },
  baseDomain: string,
): string {
  return rule.hostType === 'subdomain'
    ? `${sanitizeName(rule.host)}.${baseDomain}`
    : rule.host.toLowerCase()
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
  const [baseDomain, containers, tailscale] = await Promise.all([
    getIngressBaseDomain(),
    listContainers(),
    getTailscaleIdentity(),
  ])
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
      settings: serviceTable.settings,
      containerId: serviceTable.containerId,
      projectSlug: projectTable.slug,
      projectSettings: projectTable.settings,
      envSlug: environmentTable.slug,
      envIsDefault: environmentTable.isDefault,
    })
    .from(serviceTable)
    .innerJoin(projectTable, eq(serviceTable.projectId, projectTable.id))
    .innerJoin(environmentTable, eq(serviceTable.environmentId, environmentTable.id))

  const routes: CaddyRoute[] = []
  // Manual custom-FQDN hosts need their own ACME cert (not the wildcard).
  const customHosts: string[] = []

  for (const service of services) {
    if (service.status !== 'running' || !service.projectSlug || !service.containerId) continue
    const upstreamIp = ipByContainer.get(service.containerId)
    if (!upstreamIp) continue

    const ports = (service.ports as Array<{ container?: number }> | null) ?? []
    const namespace = deployNamespace(service.projectSlug, service.envSlug, service.envIsDefault)
    // Per-project base-domain override; falls back to the instance base domain.
    const projectSettings = (service.projectSettings ?? {}) as ProjectSettings
    const hostDomain = projectSettings.domain || baseDomain
    const serviceSettings = (service.settings ?? {}) as ServiceSettings
    const rules = serviceSettings.ingressRules ?? []

    if (rules.length > 0) {
      // Opt-in override: a service with manual rules is served ONLY on those
      // hosts, each targeting the rule's chosen port (no auto-derived host).
      for (const rule of rules) {
        const host = manualIngressHost(rule, baseDomain)
        if (rule.hostType === 'custom') customHosts.push(host)
        routes.push({
          match: [{ host: [host] }],
          handle: [
            { handler: 'reverse_proxy', upstreams: [{ dial: `${upstreamIp}:${rule.port}` }] },
          ],
        })
      }
      continue
    }

    // Auto host: the first port on `{service}-{namespace}.{hostDomain}` —
    // opt-in only (services are private by default; a manual rule above is
    // its own explicit exposure).
    if (serviceSettings.exposed !== true) continue
    const containerPort = ports[0]?.container
    if (!containerPort) continue
    routes.push({
      match: [{ host: [serviceIngressHost(service.name, namespace, hostDomain)] }],
      handle: [
        {
          handler: 'reverse_proxy',
          upstreams: [{ dial: `${upstreamIp}:${containerPort}` }],
        },
      ],
    })
  }

  // System routes: the mizu UI + nagare API on the HOST, reached from the
  // caddy container via its network gateway. Hostnames `mizu.` / `nagare.`
  // are reserved for the platform itself.
  const gateway = containers.find((c) => c.id === INGRESS_CONTAINER)?.ipv4Gateway
  if (gateway) {
    routes.push(
      {
        match: [{ host: [`mizu.${baseDomain}`] }],
        handle: [{ handler: 'reverse_proxy', upstreams: [{ dial: `${gateway}:3000` }] }],
      },
      {
        match: [{ host: [`nagare.${baseDomain}`] }],
        handle: [{ handler: 'reverse_proxy', upstreams: [{ dial: `${gateway}:3001` }] }],
      },
    )
  }

  // Fallback for unmatched hosts (raw IP, unknown names): a landing page
  // listing every routed app — never a blank white screen.
  const appList = routes
    .map((route) => `        <li><code>http://${route.match?.[0]?.host[0]}</code></li>`)
    .join('\n')
  const identityLines = [
    tailscale
      ? `      <p>tailnet: <code>${tailscale.dnsName}</code> (<code>${tailscale.ip}</code>)</p>`
      : '',
    `      <p>base domain: <code>${baseDomain}</code>${baseDomain === 'localhost' ? ' — *.localhost only resolves on this machine; set a real domain in instance settings (or point DNS at this box) for LAN/tailnet access' : ''}</p>`,
  ].join('\n')
  routes.push({
    handle: [
      {
        handler: 'static_response',
        status_code: 200,
        headers: { 'content-type': ['text/html; charset=utf-8'] },
        body: `<!doctype html><html><head><title>mizu ingress</title><style>body{background:#000;color:#a3a3a3;font-family:ui-monospace,monospace;padding:3rem}code{color:#60a5fa}h1{color:#fff;font-size:1.2rem}li{margin:.3rem 0}</style></head><body>
      <h1>水 mizu ingress</h1>
      <p>mizu ui: <code>http${baseDomain === 'localhost' ? '' : 's'}://mizu.${baseDomain}</code></p>
      <p>apps are served by hostname:</p>
      <ul>
${appList || '        <li>no apps deployed yet</li>'}
      </ul>
${identityLines}
    </body></html>`,
      },
    ],
  })

  // Wildcard TLS via Cloudflare DNS-01 when a real domain + token are set.
  // One cert (*.domain) covers every single-label app host; per-host issuance
  // is skipped explicitly so caddy never races Let's Encrypt per app.
  const cfToken = nagareEnvConfig.ingress.cloudflareApiToken
  // Wildcard TLS (DNS-01) covers every single-label host under the base domain.
  const wildcardTls = Boolean(cfToken) && baseDomain !== 'localhost'
  // Custom-FQDN ingress rules get their own cert via ACME (HTTP-01/TLS-ALPN), so
  // caddy must listen on 443 for them even when the wildcard isn't configured.
  const tlsListener = wildcardTls || customHosts.length > 0
  const appHosts = routes.flatMap((route) => route.match?.[0]?.host ?? [])
  // Skip per-host issuance for wildcard-covered hosts (the *.domain cert already
  // covers them); custom FQDNs are NOT skipped so caddy provisions each one.
  const wildcardHosts = appHosts.filter((host) => !customHosts.includes(host))
  const automaticHttps = tlsListener
    ? {
        skip_certificates: wildcardHosts,
        // Without the wildcard, the auto/subdomain hosts have no cert — don't
        // force-redirect them to HTTPS (only the custom FQDNs are TLS-served).
        ...(wildcardTls ? {} : { disable_redirects: true }),
      }
    : undefined

  const config: CaddyConfig = {
    admin: { listen: `0.0.0.0:${INGRESS_ADMIN_PORT}` },
    apps: {
      http: {
        servers: {
          mizu: {
            listen: tlsListener ? [`:${INGRESS_HTTP_PORT}`, ':443'] : [`:${INGRESS_HTTP_PORT}`],
            routes,
            ...(automaticHttps ? { automatic_https: automaticHttps } : {}),
          },
        },
      },
      ...(wildcardTls && cfToken
        ? {
            tls: {
              certificates: { automate: [`*.${baseDomain}`] },
              automation: {
                policies: [
                  {
                    subjects: [`*.${baseDomain}`],
                    issuers: [
                      {
                        module: 'acme' as const,
                        challenges: {
                          dns: {
                            provider: { name: 'cloudflare' as const, api_token: cfToken },
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            },
          }
        : {}),
    },
  }
  return config
}
