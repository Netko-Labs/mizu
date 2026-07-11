/**
 * ✧･ﾟ: *✧･ﾟ:* CONTAINER RUNTIME UTILITIES *:･ﾟ✧*:･ﾟ✧
 *
 * Detects which container runtime the machine has. Docker (Desktop/OrbStack/
 * Colima) is preferred when present because compose profiles and the nagare
 * deploy engine (dockerode) ride on it; Apple's native `container` CLI
 * (github.com/apple/container, macOS 26+) is the fallback for infra like the
 * shared Postgres — enough to run the mizu dev stack without Docker.
 */

export type ContainerRuntime = 'docker' | 'apple'

export function getContainerRuntime(): ContainerRuntime | null {
  if (Bun.which('docker')) return 'docker'
  if (Bun.which('container')) return 'apple'
  return null
}

/** Run a command, returning success instead of throwing (for probes). */
export function tryRun(cmd: string[], quiet = true): boolean {
  const result = Bun.spawnSync(cmd, {
    stdout: quiet ? 'ignore' : 'inherit',
    stderr: quiet ? 'ignore' : 'inherit',
  })
  return result.exitCode === 0
}
