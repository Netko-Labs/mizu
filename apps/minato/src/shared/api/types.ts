import type {
  CreateConnectionInput,
  CreateDatabaseInput,
  CreateProjectInput,
  CreateServiceInput,
  CreateWorkspaceInput,
  Database,
  PositionInput,
  Project,
  Service,
  UpdateDatabaseInput,
  UpdateProjectInput,
  UpdateServiceInput,
  UpdateWorkspaceInput,
} from '@mizu/nagare-domain'

/**
 * The honest wire type for nagare responses: JSON has no Date, so drizzle
 * timestamps arrive as ISO strings even though Eden's inference (from the
 * server-side return types) claims `Date`. Applied inside the api layer only.
 */
export type Serialized<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends Date | null
      ? string | null
      : T[K] extends (infer U)[]
        ? Serialized<U>[]
        : T[K] extends object
          ? Serialized<T[K]>
          : T[K]
}

export interface ProjectWithServices extends Project {
  services: Service[]
  databases: Database[]
}

export type { CreateConnectionInput, CreateProjectInput, CreateWorkspaceInput }

export interface UpdateWorkspaceParams extends UpdateWorkspaceInput {
  workspaceId: string
}

export interface UpdateProjectParams extends UpdateProjectInput {
  projectId: string
}

export interface CreateServiceParams extends CreateServiceInput {}

export interface UpdateServiceParams extends UpdateServiceInput {
  serviceId: string
}

export interface ServicePositionParams extends PositionInput {
  serviceId: string
}

export interface CreateDatabaseParams extends CreateDatabaseInput {}

export interface UpdateDatabaseParams extends UpdateDatabaseInput {
  databaseId: string
}

export interface DatabasePositionParams extends PositionInput {
  databaseId: string
}
