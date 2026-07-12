import { type Environment, environmentTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'

/**
 * Rename an environment. The slug stays stable so already-deployed container,
 * network, and ingress-host names are unaffected by a display-name change.
 */
export const renameEnvironment = async (id: string, name: string): Promise<Environment> => {
  const [environment] = await db
    .update(environmentTable)
    .set({ name })
    .where(eq(environmentTable.id, id))
    .returning()

  return environment as Environment
}
