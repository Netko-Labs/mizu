import { minatoEnvConfig } from '@mizu/minato-config'
import { user } from '@mizu/minato-domain'
import { db } from '@mizu/minato-repository'
import { protectedProcedure, publicProcedure, router } from '../../init'

export const authQueries = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user
  }),
  getEnabledAuthMethods: publicProcedure.query(async (_) => {
    return Object.entries(minatoEnvConfig.auth.socialProviders)
      .filter(([_, value]) => value?.enabled)
      .map(([key]) => key)
  }),
  // Check if any users exist in the database (for first-run setup detection)
  hasUsers: publicProcedure.query(async () => {
    const result = await db.select({ id: user.id }).from(user).limit(1)
    return result.length > 0
  }),
})
