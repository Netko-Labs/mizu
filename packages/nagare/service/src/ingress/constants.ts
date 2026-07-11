/** The managed Caddy container that fronts every deployed service */
export const INGRESS_CONTAINER = 'mizu-ingress'

// Caddy build with the cloudflare DNS module (for DNS-01 wildcard TLS)
export const CADDY_IMAGE = 'ghcr.io/caddybuilds/caddy-cloudflare:latest'

/** Bump to force ingress container recreation when its shape changes */
export const INGRESS_REVISION = '2'

/** Caddy admin API, published loopback-only on the host */
export const INGRESS_ADMIN_PORT = 2019
export const INGRESS_ADMIN_URL = `http://127.0.0.1:${INGRESS_ADMIN_PORT}`

/** Public HTTP entrypoint */
export const INGRESS_HTTP_PORT = Number(process.env.MIZU_INGRESS_PORT ?? 80)

/** Named volume for caddy state (certs, etc.) */
export const INGRESS_VOLUME = 'mizu-ingress-data'

/** Fallback base domain when instance settings define none (*.localhost resolves in browsers) */
export const DEFAULT_BASE_DOMAIN = 'localhost'
