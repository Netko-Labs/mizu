import { z } from 'zod'

/**
 * Zod schema for mizu.yml hook configuration.
 */
export const MizuHookSchema = z.object({
  command: z.string(),
  timeout: z.number().optional(),
  continueOnFailure: z.boolean().optional(),
})

/**
 * Zod schema for mizu.yml health check configuration.
 */
export const MizuHealthCheckSchema = z.object({
  type: z.enum(['http', 'tcp', 'command']),
  endpoint: z.string().optional(),
  command: z.string().optional(),
  interval: z.number().optional(),
  timeout: z.number().optional(),
  retries: z.number().optional(),
})

/**
 * Zod schema for mizu.yml scaling configuration.
 */
export const MizuScalingSchema = z.object({
  minInstances: z.number().optional(),
  maxInstances: z.number().optional(),
  cpuThreshold: z.number().optional(),
  memoryThreshold: z.number().optional(),
})

/**
 * Zod schema for mizu.yml auto discovery configuration.
 */
export const MizuAutoDiscoverySchema = z.object({
  enabled: z.boolean(),
  protocol: z.string().optional(),
  port: z.number().optional(),
})

/**
 * Zod schema for mizu.yml service configuration.
 */
export const MizuServiceConfigSchema = z.object({
  name: z.string(),
  dependsOn: z.array(z.string()).optional(),
  hooks: z
    .object({
      preDeploy: z.array(MizuHookSchema).optional(),
      postDeploy: z.array(MizuHookSchema).optional(),
      rollback: z.array(MizuHookSchema).optional(),
    })
    .optional(),
  healthCheck: MizuHealthCheckSchema.optional(),
  scaling: MizuScalingSchema.optional(),
  autoDiscovery: MizuAutoDiscoverySchema.optional(),
})

/**
 * Zod schema for mizu.yml service groups.
 */
export const MizuServiceGroupSchema = z.object({
  name: z.string(),
  services: z.array(z.string()).optional(),
  databases: z.array(z.string()).optional(),
})

/**
 * Zod schema for mizu.yml profile configuration.
 */
export const MizuProfileSchema = z.object({
  name: z.string(),
  variables: z.record(z.string(), z.string()),
})

/**
 * Zod schema for mizu.yml mesh configuration.
 */
export const MizuMeshSchema = z.object({
  enabled: z.boolean(),
  discovery: z.enum(['static', 'dns', 'consul']).optional(),
  loadBalancing: z.enum(['round-robin', 'least-connections', 'random']).optional(),
})

/**
 * Zod schema for mizu.yml deployment configuration.
 */
export const MizuDeploymentSchema = z.object({
  strategy: z.enum(['rolling', 'blue-green', 'recreate']).optional(),
  maxUnavailable: z.number().optional(),
  maxSurge: z.number().optional(),
})

/**
 * Zod schema for the complete mizu.yml file.
 */
export const MizuYmlSchema = z.object({
  version: z.literal('1.0'),
  project: z.object({
    name: z.string(),
    slug: z.string(),
    workspace: z.string(),
  }),
  profiles: z.array(MizuProfileSchema).optional(),
  services: z.array(MizuServiceConfigSchema).optional(),
  serviceGroups: z.array(MizuServiceGroupSchema).optional(),
  mesh: MizuMeshSchema.optional(),
  deployment: MizuDeploymentSchema.optional(),
})

export type MizuYml = z.infer<typeof MizuYmlSchema>
