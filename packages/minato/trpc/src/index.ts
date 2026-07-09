import { router } from './init'
import { authRouter } from './routers/auth'
import { connectionsRouter } from './routers/connections'
import { databasesRouter } from './routers/databases'
import { instanceSettingsRouter } from './routers/instance-settings'
import { logsRouter } from './routers/logs'
import { projectsRouter } from './routers/projects'
import { servicesRouter } from './routers/services'
import { systemRouter } from './routers/system'
import { workspacesRouter } from './routers/workspaces'

export const appRouter = router({
  auth: authRouter,
  connections: connectionsRouter,
  databases: databasesRouter,
  instanceSettings: instanceSettingsRouter,
  logs: logsRouter,
  projects: projectsRouter,
  services: servicesRouter,
  system: systemRouter,
  workspaces: workspacesRouter,
})

export type AppRouter = typeof appRouter

// Re-export init utilities for use in the app
export { createContext, mergeRouters, protectedProcedure, publicProcedure, router } from './init'
