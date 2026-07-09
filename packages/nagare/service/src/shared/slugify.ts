/**
 * Converts a string to a URL-friendly slug
 * @param text - The text to slugify
 * @returns A lowercase, hyphenated slug
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters (except spaces and hyphens)
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Generates a unique slug by appending a number if the base slug already exists
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 */
export const generateUniqueSlug = (baseSlug: string, existingSlugs: string[]): string => {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug
  }

  let counter = 1
  let uniqueSlug = `${baseSlug}-${counter}`

  while (existingSlugs.includes(uniqueSlug)) {
    counter++
    uniqueSlug = `${baseSlug}-${counter}`
  }

  return uniqueSlug
}
