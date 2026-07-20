import { minatoEnvConfig } from '@mizu/minato-config'
import {
  account,
  invitation,
  jwks,
  member,
  organization as organizationTable,
  session,
  user,
  verification,
} from '@mizu/minato-domain'
import { and, db, eq } from '@mizu/minato-repository'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { jwt, organization } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { ac, roles } from './permissions'

const enabledSocialProviders = Object.fromEntries(
  Object.entries(minatoEnvConfig.auth.socialProviders)
    .filter(([, provider]) => provider?.enabled)
    .map(([name, provider]) => [
      name,
      { clientId: provider?.clientId ?? '', clientSecret: provider?.clientSecret ?? '' },
    ]),
)

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'team'
  )
}

/** The user's first team membership — the default active org for a session. */
async function firstMembership(userId: string): Promise<string | null> {
  const [row] = await db
    .select({ organizationId: member.organizationId })
    .from(member)
    .where(eq(member.userId, userId))
    .limit(1)
  return row?.organizationId ?? null
}

/** The role a user holds in a given team (null if not a member). */
async function memberRole(userId: string, organizationId: string): Promise<string | null> {
  const [row] = await db
    .select({ role: member.role })
    .from(member)
    .where(and(eq(member.userId, userId), eq(member.organizationId, organizationId)))
    .limit(1)
  return row?.role ?? null
}

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
      organization: organizationTable,
      member,
      invitation,
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
  databaseHooks: {
    user: {
      create: {
        // Every new user gets a personal team they own — the first account on
        // a fresh instance therefore owns its own tenancy.
        after: async (createdUser) => {
          const orgId = crypto.randomUUID()
          await db.insert(organizationTable).values({
            id: orgId,
            name: `${createdUser.name || createdUser.email}'s team`,
            slug: `${slugify(createdUser.name || createdUser.email)}-${orgId.slice(0, 6)}`,
            createdAt: new Date(),
          })
          await db.insert(member).values({
            id: crypto.randomUUID(),
            organizationId: orgId,
            userId: createdUser.id,
            role: 'owner',
            createdAt: new Date(),
          })
        },
      },
    },
    session: {
      create: {
        // Point new sessions at the user's first team so activeOrganizationId
        // is populated (and rides the JWT) without a manual setActive.
        before: async (newSession) => {
          const activeOrganizationId = await firstMembership(newSession.userId)
          return { data: { ...newSession, activeOrganizationId } }
        },
      },
    },
  },
  plugins: [
    organization({ ac, roles }),
    jwt({
      jwt: {
        expirationTime: '1d',
        // Carry the active team + the caller's role in that team so nagare
        // can scope every request without a shared secret. definePayload
        // REPLACES the default claims, so name/email must be re-included —
        // nagare uses them for activity-feed attribution.
        definePayload: async ({ user: sessionUser, session: activeSession }) => {
          const activeOrganizationId = activeSession.activeOrganizationId ?? null
          const role = activeOrganizationId
            ? await memberRole(sessionUser.id, activeOrganizationId)
            : null
          return {
            activeOrganizationId,
            role,
            name: sessionUser.name,
            email: sessionUser.email,
          }
        },
      },
    }),
    tanstackStartCookies(),
  ],
  socialProviders: enabledSocialProviders,
  trustedOrigins: minatoEnvConfig.auth.trustedOrigins,
  secret: minatoEnvConfig.auth.secret,
})
