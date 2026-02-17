import { getInstanceSettings } from '@mizu/minato-service'
import { protectedProcedure, router } from '../../init'

export const instanceSettingsQueries = router({
  get: protectedProcedure.query(async () => {
    return getInstanceSettings()
  }),
})
