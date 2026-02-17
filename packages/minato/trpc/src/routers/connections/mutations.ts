import { connectionTypeEnum, targetTypeEnum } from '@mizu/minato-domain'
import { createConnection, deleteConnection } from '@mizu/minato-service'
import { z } from 'zod'
import { protectedProcedure, router } from '../../init'

export const connectionsMutations = router({
  create: protectedProcedure
    .input(
      z.object({
        fromServiceId: z.string().uuid(),
        toServiceId: z.string().uuid().optional(),
        toDatabaseId: z.string().uuid().optional(),
        toNetworkId: z.string().uuid().optional(),
        toExternalServiceId: z.string().uuid().optional(),
        toEnvGroupId: z.string().uuid().optional(),
        targetType: z.enum(targetTypeEnum),
        connectionType: z.enum(connectionTypeEnum),
        envVarName: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return createConnection(input)
    }),

  delete: protectedProcedure
    .input(z.object({ connectionId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return deleteConnection(input.connectionId)
    }),
})
