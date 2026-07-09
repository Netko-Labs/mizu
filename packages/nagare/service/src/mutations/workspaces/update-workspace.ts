import { type Workspace, type WorkspaceUpdate, workspaceTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { and, eq } from 'drizzle-orm'
import { generateUniqueSlug, slugify } from '../../shared'

export const updateWorkspace = async (
  workspaceId: string,
  userId: string,
  data: Partial<Pick<WorkspaceUpdate, 'name'>>,
): Promise<Workspace | undefined> => {
  const updates: Record<string, unknown> = {}

  if (data.name) {
    updates.name = data.name
    const baseSlug = slugify(data.name)

    const existingWorkspaces = await db
      .select({ id: workspaceTable.id, slug: workspaceTable.slug })
      .from(workspaceTable)
      .where(eq(workspaceTable.userId, userId))

    const existingSlugs = existingWorkspaces.filter((w) => w.id !== workspaceId).map((w) => w.slug)
    updates.slug = generateUniqueSlug(baseSlug, existingSlugs)
  }

  if (Object.keys(updates).length === 0) return undefined

  const [result] = await db
    .update(workspaceTable)
    .set(updates)
    .where(and(eq(workspaceTable.id, workspaceId), eq(workspaceTable.userId, userId)))
    .returning()

  return result as Workspace | undefined
}
