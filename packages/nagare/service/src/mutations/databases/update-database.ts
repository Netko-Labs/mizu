import { type Database, type DatabaseUpdate, databaseTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'

/**
 * Update a database's properties (name, version, etc.).
 */
export const updateDatabase = async (
  databaseId: string,
  data: Partial<DatabaseUpdate>,
): Promise<Database | undefined> => {
  const [result] = await db
    .update(databaseTable)
    .set(data)
    .where(eq(databaseTable.id, databaseId))
    .returning()
  return result as Database | undefined
}

/**
 * Update the canvas position of a database.
 */
export const updateDatabaseCanvasPosition = async (
  databaseId: string,
  position: { x: number; y: number },
): Promise<void> => {
  await db
    .update(databaseTable)
    .set({ canvasPosition: position })
    .where(eq(databaseTable.id, databaseId))
}
