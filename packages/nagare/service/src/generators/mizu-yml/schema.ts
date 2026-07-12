import { z } from 'zod'

/**
 * Zod schema for a mizu.yml port mapping.
 */
export const MizuPortSchema = z.object({
  container: z.number(),
  host: z.number().optional(),
  protocol: z.enum(['tcp', 'udp']).default('tcp'),
})

/**
 * Zod schema for a mizu.yml service. Describes what nagare actually deploys:
 * an image run by the Apple-container runtime, its ports, volume mounts,
 * env var names (values live in .env), connections, and ingress host.
 */
export const MizuServiceSchema = z.object({
  image: z.string(),
  tag: z.string().default('latest'),
  ports: z.array(MizuPortSchema).optional(),
  volumes: z.array(z.object({ source: z.string(), target: z.string() })).optional(),
  /** Env var NAMES only — values live in .env */
  env: z.array(z.string()).optional(),
  connections: z.array(z.object({ to: z.string(), env: z.string() })).optional(),
  dependsOn: z.array(z.string()).optional(),
  /** Computed public host served via the Caddy ingress */
  ingress: z.object({ host: z.string() }).optional(),
})

/**
 * Zod schema for a mizu.yml database.
 */
export const MizuDatabaseSchema = z.object({
  type: z.enum(['postgres', 'mysql', 'redis', 'mongodb', 'mariadb']),
  version: z.string().optional(),
  port: z.number().optional(),
})

/**
 * Zod schema for a mizu.yml service group (one-click app bundle).
 */
export const MizuServiceGroupSchema = z.object({
  name: z.string(),
  services: z.array(z.string()).optional(),
  databases: z.array(z.string()).optional(),
})

/**
 * Zod schema for the complete mizu.yml v2 file.
 */
export const MizuYmlSchema = z.object({
  version: z.literal(2),
  project: z.object({ name: z.string(), slug: z.string(), team: z.string() }),
  services: z.record(z.string(), MizuServiceSchema).optional(),
  databases: z.record(z.string(), MizuDatabaseSchema).optional(),
  networks: z.array(z.string()).optional(),
  serviceGroups: z.array(MizuServiceGroupSchema).optional(),
})

export type MizuYml = z.infer<typeof MizuYmlSchema>
