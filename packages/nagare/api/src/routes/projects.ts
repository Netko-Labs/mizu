import {
  CreateProjectSchema,
  ProjectBySlugQuerySchema,
  ProjectListQuerySchema,
  UpdateProjectSchema,
} from '@mizu/nagare-domain'
import {
  createProject,
  deleteProject,
  getProject,
  getProjectBySlug,
  getProjectFiles,
  getProjectWithServices,
  listProjects,
  updateProject,
} from '@mizu/nagare-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

export const projectsRoutes = new Elysia({ name: 'projects', prefix: '/projects' })
  .use(authPlugin)
  // (｡◕‿◕｡) projects in a workspace
  .get('/', { auth: true, query: ProjectListQuerySchema }, ({ user, query }) =>
    listProjects(user.id, query.workspaceId),
  )
  // (・o・)ゞ find a project by its slug
  .get(
    '/by-slug/:slug',
    { auth: true, query: ProjectBySlugQuerySchema },
    ({ user, params, query }) => getProjectBySlug(user.id, query.workspaceId, params.slug),
  )
  // (・o・)ゞ one project by id
  .get('/:projectId', { auth: true }, ({ params }) => getProject(params.projectId))
  // (◍•ᴗ•◍) project + its services and databases
  .get('/:projectId/with-services', { auth: true }, ({ params }) =>
    getProjectWithServices(params.projectId),
  )
  // (¬‿¬) the generated compose/env files
  .get('/:projectId/files', { auth: true }, ({ params }) => getProjectFiles(params.projectId))
  // ✨(っ◔◡◔)っ a brand-new project
  .post('/', { auth: true, body: CreateProjectSchema }, ({ user, body }) =>
    createProject({
      userId: user.id,
      workspaceId: body.workspaceId,
      name: body.name,
      description: body.description,
    }),
  )
  // (๑˃ᴗ˂)ﻭ tweak a project
  .patch('/:projectId', { auth: true, body: UpdateProjectSchema }, ({ params, body }) =>
    updateProject(params.projectId, body),
  )
  // (ノ﹏ヽ) delete a project
  .delete('/:projectId', { auth: true }, ({ params }) => deleteProject(params.projectId))
