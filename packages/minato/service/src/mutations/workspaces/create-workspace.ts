import { type Workspace, workspaceTable } from '@mizu/minato-domain'
import { db } from '@mizu/minato-repository'
import { eq } from 'drizzle-orm'
import { generateUniqueSlug, slugify } from '../../utils'

interface CreateWorkspaceData {
  userId: string
  name: string
}

export const createWorkspace = async (data: CreateWorkspaceData): Promise<Workspace> => {
  const baseSlug = slugify(data.name)

  // Get existing slugs to ensure uniqueness
  const existingWorkspaces = await db
    .select({ slug: workspaceTable.slug })
    .from(workspaceTable)
    .where(eq(workspaceTable.userId, data.userId))

  const existingSlugs = existingWorkspaces.map((w) => w.slug)
  const slug = generateUniqueSlug(baseSlug, existingSlugs)

  const [workspace] = await db
    .insert(workspaceTable)
    .values({
      userId: data.userId,
      name: data.name,
      slug,
    })
    .returning()

  return workspace as Workspace
}
