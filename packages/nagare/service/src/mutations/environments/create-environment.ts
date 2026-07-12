import { type Environment, environmentTable } from '@mizu/nagare-domain'
import { db } from '@mizu/nagare-repository'
import { eq } from 'drizzle-orm'
import { generateUniqueSlug, slugify } from '../../shared'

interface CreateEnvironmentData {
  projectId: string
  name: string
  isDefault?: boolean
}

/** Create an environment in a project; slug is unique within the project. */
export const createEnvironment = async (data: CreateEnvironmentData): Promise<Environment> => {
  const existing = await db
    .select({ slug: environmentTable.slug })
    .from(environmentTable)
    .where(eq(environmentTable.projectId, data.projectId))

  const slug = generateUniqueSlug(
    slugify(data.name),
    existing.map((e) => e.slug),
  )

  const [environment] = await db
    .insert(environmentTable)
    .values({
      projectId: data.projectId,
      name: data.name,
      slug,
      isDefault: data.isDefault ?? false,
    })
    .returning()

  return environment as Environment
}
