import { mergeRouters } from '../../init'
import { databasesMutations } from './mutations'
import { databasesQueries } from './queries'

export const databasesRouter = mergeRouters(databasesQueries, databasesMutations)
