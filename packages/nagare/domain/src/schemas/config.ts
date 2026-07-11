import { z } from 'zod'

export const NagareConfigSchema = z.object({
  app: z.object({
    dev: z.boolean().default(false),
    port: z.number().default(3001),
    cors: z.array(z.string()).default(['http://localhost:3000']),
    webBaseUrl: z.string().url(),
    encryptionKey: z.string(),
  }),
  db: z.object({
    url: z.string(),
  }),
  ingress: z.object({
    /** Cloudflare API token (Zone:DNS:Edit) enabling DNS-01 wildcard TLS */
    cloudflareApiToken: z.string().optional(),
  }),
})

export type NagareConfig = z.infer<typeof NagareConfigSchema>
