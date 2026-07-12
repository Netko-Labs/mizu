import { CreateProjectSchema, UpdateProjectSchema } from '@mizu/nagare-domain'
import {
  assertProjectOwned,
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
  // (｡◕‿◕｡) projects in the active team
  .get('/', { auth: true }, ({ user }) => listProjects(user.organizationId))
  // (・o・)ゞ find a project by its slug (scoped to the team)
  .get('/by-slug/:slug', { auth: true }, ({ user, params }) =>
    getProjectBySlug(user.organizationId, params.slug),
  )
  // (・o・)ゞ one project by id
  .get('/:projectId', { auth: true }, async ({ user, params }) => {
    await assertProjectOwned(params.projectId, user.organizationId)
    return getProject(params.projectId)
  })
  // (◍•ᴗ•◍) project + its services and databases
  .get('/:projectId/with-services', { auth: true }, async ({ user, params }) => {
    await assertProjectOwned(params.projectId, user.organizationId)
    return getProjectWithServices(params.projectId)
  })
  // (¬‿¬) the generated compose/env files
  .get('/:projectId/files', { auth: true }, async ({ user, params }) => {
    await assertProjectOwned(params.projectId, user.organizationId)
    return getProjectFiles(params.projectId)
  })
  // ✨(っ◔◡◔)っ a brand-new project in the active team
  .post('/', { auth: true, body: CreateProjectSchema }, ({ user, body }) =>
    createProject({
      organizationId: user.organizationId,
      name: body.name,
      description: body.description,
    }),
  )
  // (๑˃ᴗ˂)ﻭ tweak a project
  .patch(
    '/:projectId',
    { auth: true, body: UpdateProjectSchema },
    async ({ user, params, body }) => {
      await assertProjectOwned(params.projectId, user.organizationId)
      return updateProject(params.projectId, body)
    },
  )
  // (ノ﹏ヽ) delete a project
  .delete('/:projectId', { auth: true }, async ({ user, params }) => {
    await assertProjectOwned(params.projectId, user.organizationId)
    return deleteProject(params.projectId)
  })
