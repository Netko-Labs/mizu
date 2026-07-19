/**
 * Service template system for Mizu
 * Templates provide pre-configured service definitions for common applications
 */

export interface ServiceTemplate {
  id: string
  name: string
  description: string
  icon?: string
  category: 'database' | 'cache' | 'web' | 'tool' | 'other'
  sourceType: 'image'
  sourceConfig: {
    image: string
    tag?: string
  }
  defaultEnvVars?: Record<string, string>
  defaultPorts?: Array<{ container: number; host?: number; protocol?: 'tcp' | 'udp' }>
  /**
   * Config files the image needs at startup. mizu writes each `content` to a
   * host file and bind-mounts it at `path` in the container — for images (like
   * CLIProxyAPI) that require a config file and won't boot without one.
   */
  configFiles?: Array<{ path: string; content: string }>
  /**
   * Container directories that must survive redeploys (provider auth, plugins,
   * caches). mizu backs each with a persistent host dir and bind-mounts it, so
   * its contents outlive the container — e.g. CLIProxyAPI's `/root/.cli-proxy-api`
   * auth dir and `/CLIProxyAPI/plugins`.
   */
  volumes?: string[]
  healthCheck?: {
    test: string[]
    interval: string
    timeout: string
    retries: number
  }
}

export interface DatabaseTemplate extends ServiceTemplate {
  category: 'database'
  databaseType: 'postgres' | 'mysql' | 'redis' | 'mongodb' | 'mariadb'
  defaultCredentials?: {
    usernameEnvVar: string
    passwordEnvVar: string
    databaseEnvVar?: string
    rootPasswordEnvVar?: string
  }
}
