import { runQuiet } from './shell'

/**
 * ✧･ﾟ: *✧･ﾟ:* VALIDATION UTILITIES *:･ﾟ✧*:･ﾟ✧
 *
 * Environment validation helpers (◕‿◕✿)
 */

export const validateEnvironment = async (): Promise<{ valid: boolean; errors: string[] }> => {
  const errors: string[] = []

  // Check Bun version
  try {
    const bunVersion = await runQuiet(['bun', '--version'])
    const version = Number.parseFloat(bunVersion.trim())
    if (version < 1.0) {
      errors.push(`Bun 1.0+ is required (found ${bunVersion.trim()})`)
    }
  } catch {
    errors.push('Bun is not installed')
  }

  // Check the Apple container runtime
  try {
    await runQuiet(['container', '--version'])
  } catch {
    errors.push('Apple `container` runtime is not installed (run ./scripts/setup-devbox.sh)')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export const printValidationErrors = (errors: string[]) => {
  console.error('\nEnvironment validation failed:\n')
  for (const e of errors) {
    console.error(`  ✗ ${e}`)
  }
  console.error('\nPlease fix the above issues and try again.\n')
}

export const requireValidEnvironment = async () => {
  const { valid, errors } = await validateEnvironment()
  if (!valid) {
    printValidationErrors(errors)
    process.exit(1)
  }
}
