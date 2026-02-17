import { mergeRouters } from '../../init'
import { projectsMutations } from './mutations'
import { projectsQueries } from './queries'

export const projectsRouter = mergeRouters(projectsQueries, projectsMutations)
