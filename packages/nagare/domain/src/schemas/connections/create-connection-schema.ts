import { z } from 'zod'
import { connectionTypeEnum, targetTypeEnum } from '../../db/service-connections'

export const CreateConnectionSchema = z.object({
  fromServiceId: z.uuid(),
  toServiceId: z.uuid().optional(),
  toDatabaseId: z.uuid().optional(),
  toNetworkId: z.uuid().optional(),
  toExternalServiceId: z.uuid().optional(),
  toEnvGroupId: z.uuid().optional(),
  targetType: z.enum(targetTypeEnum),
  connectionType: z.enum(connectionTypeEnum),
  envVarName: z.string().optional(),
})

export type CreateConnectionInput = z.infer<typeof CreateConnectionSchema>
