import { type Project, projectTable, workspaceTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { and, eq } from 'drizzle-orm'
import { generateUniqueSlug, slugify } from '../../shared'

interface CreateProjectData {
  userId: string
  workspaceId: string
  name: string
  description?: string
}

export const createProject = async (data: CreateProjectData): Promise<Project> => {
  const [workspace] = await db
    .select({ id: workspaceTable.id })
    .from(workspaceTable)
    .where(and(eq(workspaceTable.id, data.workspaceId), eq(workspaceTable.userId, data.userId)))

  if (!workspace) {
    throw new Error('Workspace not found')
  }

  const baseSlug = slugify(data.name)

  // Get existing slugs to ensure uniqueness
  const existingProjects = await db
    .select({ slug: projectTable.slug })
    .from(projectTable)
    .where(
      and(eq(projectTable.userId, data.userId), eq(projectTable.workspaceId, data.workspaceId)),
    )

  const existingSlugs = existingProjects.map((p) => p.slug)
  const slug = generateUniqueSlug(baseSlug, existingSlugs)

  // TODO: Create Docker network for the project
  // This will be implemented when Docker integration is added
  // const networkName = `mizu-${slug}`
  // await docker.createNetwork(networkName)

  const [project] = await db
    .insert(projectTable)
    .values({
      userId: data.userId,
      workspaceId: data.workspaceId,
      name: data.name,
      slug,
      description: data.description,
    })
    .returning()

  return project as Project
}
