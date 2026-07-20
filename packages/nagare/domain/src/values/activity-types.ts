/**
 * Every event kind the project activity feed can record. Shared by the
 * activity table's enum and the zod schemas so the two never drift.
 */
export const ACTIVITY_TYPES = [
  'service.create',
  'service.update',
  'service.delete',
  'service.deploy',
  'service.start',
  'service.stop',
  'service.restart',
  'service.rollback',
  'service.env-update',
  'service.exec',
  'service.file-edit',
  'database.create',
  'database.update',
  'database.delete',
  'database.deploy',
  'database.start',
  'database.stop',
  'project.update',
] as const

export type ActivityType = (typeof ACTIVITY_TYPES)[number]
