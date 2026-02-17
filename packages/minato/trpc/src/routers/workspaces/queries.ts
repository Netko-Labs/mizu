import { getWorkspaces } from '@mizu/minato-service'
import { protectedProcedure, router } from '../../init'

export const workspacesQueries = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getWorkspaces(ctx.user.id)
  }),
})
