/**
 * ✧･ﾟ: *✧･ﾟ:* CONTAINER RUNTIME UTILITIES *:･ﾟ✧*:･ﾟ✧
 *
 * Mizu is apple-container-first: the native `container` CLI
 * (github.com/apple/container, macOS 26+) is the only runtime.
 */

/** Exit with an install hint when the `container` binary is missing. */
export function requireAppleContainer(): void {
  if (Bun.which('container')) return
  console.error('❌ Apple `container` runtime not found (macOS 26+, Apple Silicon).')
  console.error('   Install it with: ./scripts/setup-devbox.sh')
  console.error('   or grab the pkg: https://github.com/apple/container/releases')
  process.exit(1)
}

/** Run a command, returning success instead of throwing (for probes). */
export function tryRun(cmd: string[], quiet = true): boolean {
  const result = Bun.spawnSync(cmd, {
    stdout: quiet ? 'ignore' : 'inherit',
    stderr: quiet ? 'ignore' : 'inherit',
  })
  return result.exitCode === 0
}
