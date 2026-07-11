export { generateEnvExampleFile, generateEnvFile } from './env-generator'
export { generateMizuYml, type MizuYml, MizuYmlSchema, parseMizuYml } from './mizu-yml'
export * from './types'

import { generateEnvExampleFile, generateEnvFile } from './env-generator'
import { generateMizuYml } from './mizu-yml'
import type { GeneratedFiles, GenerationOptions, ProjectManifest } from './types'

/**
 * Generate all project files from a manifest.
 *
 * Returns an object with all generated file contents.
 * Use the filesystem service to write these to disk.
 */
export async function generateAllFiles(
  manifest: ProjectManifest,
  options: GenerationOptions = {},
): Promise<GeneratedFiles> {
  const { only } = options

  const files: GeneratedFiles = {
    'mizu.yml': '',
    '.env': '',
    '.env.example': '',
  }

  // Generate only requested files, or all if not specified
  const shouldGenerate = (file: keyof GeneratedFiles) => !only || only.includes(file)

  if (shouldGenerate('mizu.yml')) {
    files['mizu.yml'] = await generateMizuYml(manifest, options)
  }

  if (shouldGenerate('.env')) {
    files['.env'] = generateEnvFile(manifest)
  }

  if (shouldGenerate('.env.example')) {
    files['.env.example'] = generateEnvExampleFile(manifest)
  }

  return files
}
