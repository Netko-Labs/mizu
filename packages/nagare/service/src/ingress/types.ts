export interface CaddyUpstream {
  dial: string
}

export interface CaddyRoute {
  match: Array<{ host: string[] }>
  handle: Array<{ handler: 'reverse_proxy'; upstreams: CaddyUpstream[] }>
}

export interface CaddyConfig {
  admin: { listen: string }
  apps: {
    http: {
      servers: {
        mizu: {
          listen: string[]
          routes: CaddyRoute[]
        }
      }
    }
  }
}
