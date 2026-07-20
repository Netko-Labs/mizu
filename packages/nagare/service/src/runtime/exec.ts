import type { ExecResult } from '@mizu/nagare-domain'
import { CONTAINER_BIN } from './constants'

const EXEC_TIMEOUT_MS = 20_000
const OUTPUT_LIMIT = 256 * 1024

/**
 * Run a one-shot shell command inside a container and capture BOTH streams and
 * the exit code (unlike runtimeCli, a nonzero exit is a result here, not an
 * error — the console shows the failure to the user).
 */
export async function execCommandInContainer(
  containerId: string,
  command: string,
): Promise<ExecResult> {
  const proc = Bun.spawn([CONTAINER_BIN, 'exec', containerId, 'sh', '-lc', command], {
    stdout: 'pipe',
    stderr: 'pipe',
  })

  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    proc.kill()
  }, EXEC_TIMEOUT_MS)

  try {
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ])
    return {
      stdout: stdout.slice(0, OUTPUT_LIMIT),
      stderr: stderr.slice(0, OUTPUT_LIMIT),
      exitCode,
      timedOut,
    }
  } finally {
    clearTimeout(timer)
  }
}
