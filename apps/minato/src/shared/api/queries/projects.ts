import type { Project } from '@mizu/nagare-domain'
import { queryOptions } from '@tanstack/react-query'
import { nagare } from '@/integrations/nagare'
import type {
  CreateProjectInput,
  ProjectWithServices,
  Serialized,
  UpdateProjectParams,
} from '../types'
import { unwrap } from '../utils'

// eden types drizzle timestamps as Date, but JSON delivers ISO strings —
// Serialized<> is the honest wire type (see ../types.ts).

// Projects are scoped server-side by the JWT's active organization; the team id
// is carried only in the query keys so switching teams refetches under the new
// tenant (see WorkspaceProvider.setCurrentWorkspaceId).
export const projectKeys = {
  all: ['projects'] as const,
  list: (teamId: string) => ['projects', 'list', teamId] as const,
  bySlug: (teamId: string, slug: string) => ['projects', 'by-slug', teamId, slug] as const,
  byId: (projectId: string) => ['projects', projectId] as const,
  withServices: (projectId: string) => ['projects', projectId, 'with-services'] as const,
  generatedFiles: (projectId: string) => ['projects', projectId, 'generated-files'] as const,
}

export const projectQueries = {
  list: (teamId: string) =>
    queryOptions({
      queryKey: projectKeys.list(teamId),
      queryFn: async () =>
        (await unwrap(nagare.projects.get())) as unknown as Serialized<Project>[],
    }),
  bySlug: (teamId: string, slug: string) =>
    queryOptions({
      queryKey: projectKeys.bySlug(teamId, slug),
      queryFn: async () =>
        (await unwrap(nagare.projects['by-slug']({ slug }).get())) as unknown as
          | Serialized<Project>
          | undefined,
    }),
  byId: (projectId: string) =>
    queryOptions({
      queryKey: projectKeys.byId(projectId),
      queryFn: async () =>
        (await unwrap(nagare.projects({ projectId }).get())) as unknown as
          | Serialized<Project>
          | undefined,
    }),
  withServices: (projectId: string) =>
    queryOptions({
      queryKey: projectKeys.withServices(projectId),
      queryFn: async () =>
        (await unwrap(nagare.projects({ projectId })['with-services'].get())) as unknown as
          | Serialized<ProjectWithServices>
          | undefined,
    }),
  generatedFiles: (projectId: string) =>
    queryOptions({
      queryKey: projectKeys.generatedFiles(projectId),
      queryFn: () => unwrap(nagare.projects({ projectId }).files.get()),
    }),
}

export const createProject = async (input: CreateProjectInput) =>
  (await unwrap(nagare.projects.post(input))) as unknown as Serialized<Project>

export const updateProject = async ({ projectId, ...body }: UpdateProjectParams) =>
  (await unwrap(nagare.projects({ projectId }).patch(body))) as unknown as Serialized<Project>

export const deleteProject = (projectId: string) => unwrap(nagare.projects({ projectId }).delete())
