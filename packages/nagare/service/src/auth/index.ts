import { nagareEnvConfig } from '@mizu/nagare-config'
import { createRemoteJWKSet, jwtVerify } from 'jose'

const WEB = nagareEnvConfig.app.webBaseUrl
const jwks = createRemoteJWKSet(new URL('/api/auth/jwks', WEB))

export type NagareUser = { id: string; name: string }

/**
 * Verify a JWT minted by minato's auth server against its JWKS. No shared
 * secret — trust is anchored on minato's public keys.
 */
export async function verifyToken(token: string): Promise<NagareUser | null> {
  try {
    const { payload } = await jwtVerify(token, jwks, { issuer: WEB, audience: WEB })
    const id = typeof payload.sub === 'string' ? payload.sub : undefined
    if (!id) return null
    const name =
      (typeof payload.name === 'string' && payload.name) ||
      (typeof payload.email === 'string' && payload.email) ||
      `user-${id.slice(0, 6)}`
    return { id, name }
  } catch {
    return null
  }
}
