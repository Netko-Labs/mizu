import { ActivityListQuerySchema } from '@mizu/nagare-domain'
import { assertProjectOwned, listActivities } from '@mizu/nagare-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

export const activitiesRoutes = new Elysia({ name: 'activities', prefix: '/activities' })
  .use(authPlugin)
  // 📜 the project's event trail, newest first (cursor = `before` timestamp)
  .get('/', { auth: true, query: ActivityListQuerySchema }, async ({ user, query }) => {
    await assertProjectOwned(query.projectId, user.organizationId)
    return listActivities(query.projectId, query.limit, query.before)
  })
