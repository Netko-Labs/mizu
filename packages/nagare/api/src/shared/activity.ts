import type { ActivityType, Database, Service } from '@mizu/nagare-domain'
import { type NagareUser, recordActivity } from '@mizu/nagare-service'

/**
 * Fire-and-forget feed writers for route handlers. The authz asserts already
 * return the owned row, so callers have entity name/project/environment for
 * free — these just shape the envelope. Never awaited, never throws
 * (recordActivity catches internally).
 */

interface EntityRow {
  id: string
  name: string
  projectId: string
  environmentId: string
}

function logEntityActivity(
  entityType: 'service' | 'database',
  entity: EntityRow,
  user: NagareUser,
  type: ActivityType,
  metadata?: Record<string, unknown>,
): void {
  void recordActivity({
    projectId: entity.projectId,
    environmentId: entity.environmentId,
    type,
    entityType,
    entityId: entity.id,
    entityName: entity.name,
    userId: user.id,
    userName: user.name,
    metadata: metadata ?? {},
  })
}

export function logServiceActivity(
  service: Pick<Service, 'id' | 'name' | 'projectId' | 'environmentId'>,
  user: NagareUser,
  type: ActivityType,
  metadata?: Record<string, unknown>,
): void {
  logEntityActivity('service', service, user, type, metadata)
}

export function logDatabaseActivity(
  database: Pick<Database, 'id' | 'name' | 'projectId' | 'environmentId'>,
  user: NagareUser,
  type: ActivityType,
  metadata?: Record<string, unknown>,
): void {
  logEntityActivity('database', database, user, type, metadata)
}
