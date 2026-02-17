import { mergeRouters } from '../../init'
import { instanceSettingsMutations } from './mutations'
import { instanceSettingsQueries } from './queries'

export const instanceSettingsRouter = mergeRouters(
  instanceSettingsQueries,
  instanceSettingsMutations,
)
