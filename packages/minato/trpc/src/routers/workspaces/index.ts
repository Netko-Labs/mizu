import { mergeRouters } from '../../init'
import { workspacesMutations } from './mutations'
import { workspacesQueries } from './queries'

export const workspacesRouter = mergeRouters(workspacesQueries, workspacesMutations)
