import { verifyToken } from '@mizu/nagare-service'
import { Elysia } from 'elysia'

/**
 * HTTP auth macro: routes opt in with `{ auth: true }` and receive a non-null
 * `user` resolved from the `Authorization: Bearer <jwt>` header (verified via
 * minato's JWKS). Unauthenticated requests get 401.
 */
export const authPlugin = new Elysia({ name: 'auth' }).macro({
  auth: {
    async derive({ headers, status }) {
      const token = headers.authorization?.replace(/^Bearer /, '')
      const user = token ? await verifyToken(token) : null
      if (!user) return status(401, 'Unauthorized')
      return { user }
    },
  },
  // Stricter opt-in: authenticated AND the caller is an owner/admin of the
  // active team. Used for team-wide/instance settings.
  ownerOrAdmin: {
    async derive({ headers, status }) {
      const token = headers.authorization?.replace(/^Bearer /, '')
      const user = token ? await verifyToken(token) : null
      if (!user) return status(401, 'Unauthorized')
      if (user.role !== 'owner' && user.role !== 'admin') {
        return status(403, 'Forbidden: requires owner or admin')
      }
      return { user }
    },
  },
})
