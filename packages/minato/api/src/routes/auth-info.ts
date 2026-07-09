import { minatoEnvConfig } from '@mizu/minato-config'
import { user } from '@mizu/minato-domain'
import { db } from '@mizu/minato-repository'
import { Elysia } from 'elysia'

export const authInfoRoutes = new Elysia({ name: 'auth-info' })
  // (｡◕‿◕｡) which sign-in methods are available — public, drives the login form
  .get('/auth-methods', () => {
    const social = Object.entries(minatoEnvConfig.auth.socialProviders)
      .filter(([, provider]) => provider?.enabled)
      .map(([name]) => name)
    return {
      emailAndPassword: minatoEnvConfig.auth.emailAndPassword.enabled,
      social,
    }
  })
  // (・o・)ゞ first-run detection — do any users exist yet?
  .get('/has-users', async () => {
    const result = await db.select({ id: user.id }).from(user).limit(1)
    return { hasUsers: result.length > 0 }
  })
