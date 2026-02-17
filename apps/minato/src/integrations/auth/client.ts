import { magicLinkClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

// Get base URL - for client use window.location.origin, for SSR use env or default
function getBaseURL() {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  // SSR - use environment variable or default to localhost
  return process.env.BETTER_AUTH_URL || 'http://localhost:3000'
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [magicLinkClient()],
})

export const { signIn, signOut, signUp, useSession, getSession } = authClient
