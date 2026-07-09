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
