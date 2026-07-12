import { type Environment, environmentTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'

export const getEnvironment = async (id: string): Promise<Environment | undefined> => {
  const [environment] = await db
    .select()
    .from(environmentTable)
    .where(eq(environmentTable.id, id))
    .limit(1)

  return environment as Environment | undefined
}
