import { type NagareConfig, NagareConfigSchema } from '@mizu/nagare-domain'

const nagareConfig: NagareConfig = {
  app: {
    dev: process.env.NODE_ENV !== 'production',
    port: Number(process.env.PORT ?? 3001),
    cors: process.env.CORS?.split(',') ?? ['http://localhost:3000'],
    webBaseUrl: process.env.WEB_BASE_URL ?? 'http://localhost:3000',
    // Where nagare fetches minato's JWKS. Defaults to webBaseUrl, but can point
    // straight at minato (e.g. http://localhost:3000) so key verification never
    // routes through the public ingress — which matters at first-run before a
    // domain is configured, and keeps this internal call off the public path.
    authJwksUrl: process.env.AUTH_JWKS_URL ?? process.env.WEB_BASE_URL ?? 'http://localhost:3000',
    encryptionKey: process.env.ENCRYPTION_KEY ?? '',
  },
  db: {
    url: process.env.DATABASE_URL ?? '',
  },
  ingress: {
    cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN || undefined,
  },
}

export const nagareEnvConfig = NagareConfigSchema.parse(nagareConfig)
