import { createAccessControl } from 'better-auth/plugins/access'
import { defaultStatements } from 'better-auth/plugins/organization/access'

/**
 * Mizu's access-control statements: the resources + actions roles can be
 * granted. `defaultStatements` carries the org plugin's own primitives
 * (organization, member, invitation); we add mizu concerns on top.
 */
const statement = {
  ...defaultStatements,
  project: ['create', 'read', 'update', 'delete', 'deploy'],
  instanceSettings: ['read', 'update'],
} as const

export const ac = createAccessControl(statement)

/** A regular teammate: full project lifecycle, no team/instance admin. */
export const member = ac.newRole({
  project: ['create', 'read', 'update', 'delete', 'deploy'],
  instanceSettings: ['read'],
})

/** Admins additionally manage members, invites, and instance settings. */
export const admin = ac.newRole({
  project: ['create', 'read', 'update', 'delete', 'deploy'],
  instanceSettings: ['read', 'update'],
  member: ['create', 'update', 'delete'],
  invitation: ['create', 'cancel'],
})

/** Owner: everything, including deleting the team. */
export const owner = ac.newRole({
  project: ['create', 'read', 'update', 'delete', 'deploy'],
  instanceSettings: ['read', 'update'],
  member: ['create', 'update', 'delete'],
  invitation: ['create', 'cancel'],
  organization: ['update', 'delete'],
})

export const roles = { owner, admin, member }
