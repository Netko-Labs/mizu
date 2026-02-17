import { mergeRouters } from '../../init'
import { logsQueries } from './queries'
import { logsSubscriptions } from './subscriptions'

export const logsRouter = mergeRouters(logsQueries, logsSubscriptions)
