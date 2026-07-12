import { type Project, projectTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { generateUniqueSlug, slugify } from '../../shared'
import { ensureDefaultEnvironment } from '../environments/ensure-default-environment'

interface CreateProjectData {
  organizationId: string
  name: string
  description?: string
}

export const createProject = async (data: CreateProjectData): Promise<Project> => {
  const baseSlug = slugify(data.name)

  // Slug unique within the team
  const existingProjects = await db
    .select({ slug: projectTable.slug })
    .from(projectTable)
    .where(eq(projectTable.organizationId, data.organizationId))

  const slug = generateUniqueSlug(
    baseSlug,
    existingProjects.map((p) => p.slug),
  )

  const [project] = await db
    .insert(projectTable)
    .values({
      organizationId: data.organizationId,
      name: data.name,
      slug,
      description: data.description,
    })
    .returning()

  if (!project) throw new Error('Failed to create project')

  // Every project starts with a default 'production' environment.
  await ensureDefaultEnvironment(project.id)

  return project as Project
}
