import { CreateWorkspaceSchema, UpdateWorkspaceSchema } from '@mizu/nagare-domain'
import { createWorkspace, deleteWorkspace, getWorkspaces, updateWorkspace } from '@mizu/nagare-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

export const workspacesRoutes = new Elysia({ name: 'workspaces', prefix: '/workspaces' })
  .use(authPlugin)
  // (｡◕‿◕｡) every workspace the user owns
  .get('/', { auth: true }, ({ user }) => getWorkspaces(user.id))
  // ✨(っ◔◡◔)っ a fresh workspace
  .post('/', { auth: true, body: CreateWorkspaceSchema }, ({ user, body }) =>
    createWorkspace({ userId: user.id, name: body.name }),
  )
  // (๑˃ᴗ˂)ﻭ rename a workspace
  .patch('/:workspaceId', { auth: true, body: UpdateWorkspaceSchema }, ({ user, params, body }) =>
    updateWorkspace(params.workspaceId, user.id, { name: body.name }),
  )
  // (ノ﹏ヽ) poof — workspace gone
  .delete('/:workspaceId', { auth: true }, ({ user, params }) =>
    deleteWorkspace(params.workspaceId, user.id),
  )
