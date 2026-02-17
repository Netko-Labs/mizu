import { mergeRouters } from '../../init'
import { connectionsMutations } from './mutations'
import { connectionsQueries } from './queries'

export const connectionsRouter = mergeRouters(connectionsQueries, connectionsMutations)
