export interface CaddyUpstream {
  dial: string
}

export type CaddyHandler =
  | { handler: 'reverse_proxy'; upstreams: CaddyUpstream[] }
  | {
      handler: 'static_response'
      status_code: number
      headers?: Record<string, string[]>
      body: string
    }

export interface CaddyRoute {
  match?: Array<{ host: string[] }>
  handle: CaddyHandler[]
}

export interface CaddyConfig {
  admin: { listen: string }
  apps: {
    http: {
      servers: {
        mizu: {
          listen: string[]
          routes: CaddyRoute[]
          automatic_https?: { skip_certificates: string[] }
        }
      }
    }
    tls?: {
      certificates: { automate: string[] }
      automation: {
        policies: Array<{
          subjects: string[]
          issuers: Array<{
            module: 'acme'
            challenges: {
              dns: { provider: { name: 'cloudflare'; api_token: string } }
            }
          }>
        }>
      }
    }
  }
}
