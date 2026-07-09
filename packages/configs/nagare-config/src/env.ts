import { type NagareConfig, NagareConfigSchema } from '@mizu/nagare-domain'

const nagareConfig: NagareConfig = {
  app: {
    dev: process.env.NODE_ENV !== 'production',
    port: Number(process.env.PORT ?? 3001),
    cors: process.env.CORS?.split(',') ?? ['http://localhost:3000'],
    webBaseUrl: process.env.WEB_BASE_URL ?? 'http://localhost:3000',
    encryptionKey: process.env.ENCRYPTION_KEY ?? '',
  },
  db: {
    url: process.env.DATABASE_URL ?? '',
  },
}

export const nagareEnvConfig = NagareConfigSchema.parse(nagareConfig)
