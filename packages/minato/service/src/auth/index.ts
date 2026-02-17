import { minatoEnvConfig } from '@mizu/minato-config'
import { account, jwks, session, user, verification } from '@mizu/minato-domain'
import { db } from '@mizu/minato-repository'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { jwt } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

export const auth = betterAuth({
  appName: 'Minato',
  baseURL: minatoEnvConfig.app.baseUrl,
  basePath: '/api/auth',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      session,
      account,
      verification,
      jwks,
    },
  }),
  advanced: {
    cookiePrefix: 'minato',
  },
  emailAndPassword: {
    enabled: minatoEnvConfig.auth.emailAndPassword.enabled,
    minPasswordLength: minatoEnvConfig.auth.emailAndPassword.minPasswordLength,
    maxPasswordLength: minatoEnvConfig.auth.emailAndPassword.maxPasswordLength,
    requireEmailVerification: false,
  },
  plugins: [
    jwt({
      jwt: {
        expirationTime: '1d',
      },
    }),
    tanstackStartCookies(),
  ],
  trustedOrigins: minatoEnvConfig.auth.trustedOrigins,
  secret: minatoEnvConfig.auth.secret,
})
