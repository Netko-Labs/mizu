import { mergeRouters } from '../../init'
import { servicesMutations } from './mutations'
import { servicesQueries } from './queries'

export const servicesRouter = mergeRouters(servicesQueries, servicesMutations)
