import { nagareEnvConfig } from '@mizu/nagare-config'
import { createRemoteJWKSet, jwtVerify } from 'jose'

const WEB = nagareEnvConfig.app.webBaseUrl
// Fetch keys directly from minato (authJwksUrl), but still validate the token's
// issuer/audience against the public WEB origin. Keeps this internal call off
// the public ingress path (which isn't routable at first-run).
const jwks = createRemoteJWKSet(new URL('/api/auth/jwks', nagareEnvConfig.app.authJwksUrl))

export type TeamRole = 'owner' | 'admin' | 'member'

export type NagareUser = {
  id: string
  name: string
  /** Active team (better-auth organization.id) — the tenancy scope. */
  organizationId: string
  /** The caller's role within the active team. */
  role: TeamRole
}

/**
 * Verify a JWT minted by minato's auth server against its JWKS. No shared
 * secret — trust is anchored on minato's public keys. Requires an active
 * team claim; a token with no organization cannot act (returns null → 401).
 */
export async function verifyToken(token: string): Promise<NagareUser | null> {
  try {
    const { payload } = await jwtVerify(token, jwks, { issuer: WEB, audience: WEB })
    const id = typeof payload.sub === 'string' ? payload.sub : undefined
    const organizationId =
      typeof payload.activeOrganizationId === 'string' ? payload.activeOrganizationId : undefined
    if (!id || !organizationId) return null
    const role: TeamRole =
      payload.role === 'owner' || payload.role === 'admin' ? payload.role : 'member'
    const name =
      (typeof payload.name === 'string' && payload.name) ||
      (typeof payload.email === 'string' && payload.email) ||
      `user-${id.slice(0, 6)}`
    return { id, name, organizationId, role }
  } catch {
    return null
  }
}
