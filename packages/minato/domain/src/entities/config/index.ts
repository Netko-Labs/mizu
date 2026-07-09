import { z } from 'zod'

const _protoSocialProviderSchema = z.object({
  enabled: z.boolean(),
  clientId: z.string(),
  clientSecret: z.string(),
})

const transformSocialProviderSchema = (data: z.infer<typeof _protoSocialProviderSchema>) => {
  if (!data.clientId || !data.clientSecret) {
    return undefined
  }
  return data
}

const _protoMinatoConfigSchema = z.object({
  app: z.object({
    dev: z.boolean().default(false),
    port: z.number().default(3000),
    cors: z.array(z.string()).default(['http://localhost:3000', 'http://localhost:5173']),
    baseUrl: z.string().url(),
    sentryDsn: z.string().optional(),
    encryptionKey: z.string(),
  }),
  cache: z.object({
    url: z.string(),
  }),
  db: z.object({
    url: z.string(),
  }),
  auth: z.object({
    secret: z.string().optional(),
    emailAndPassword: z.object({
      enabled: z.boolean().default(true),
      minPasswordLength: z.number().default(8),
      maxPasswordLength: z.number().default(128),
    }),
    trustedOrigins: z.array(z.string()).default(['http://localhost:3000', 'http://localhost:5173']),
    socialProviders: z.object({
      github: _protoSocialProviderSchema.transform(transformSocialProviderSchema).optional(),
      google: _protoSocialProviderSchema.transform(transformSocialProviderSchema).optional(),
      discord: _protoSocialProviderSchema.transform(transformSocialProviderSchema).optional(),
    }),
  }),
})

export const MinatoConfigSchema = _protoMinatoConfigSchema
export type MinatoConfig = z.infer<typeof MinatoConfigSchema>
