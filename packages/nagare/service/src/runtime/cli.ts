/**
 * Typed wrapper over Apple's `container` CLI — the only process boundary of
 * the runtime module. Args are argv arrays (never shell strings), stdout is
 * parsed defensively, and failures map to RuntimeError with a code the
 * callers can branch on.
 */

import { createLogger } from '@mizu/logger'
import { CLI_DEFAULT_TIMEOUT_MS, CONTAINER_BIN } from './constants'
import { type CliOptions, type CliResult, RuntimeError } from './types'

const logger = createLogger('runtime:cli')

function classifyError(stderr: string, exitCode: number): string {
  if (/not found|no such|does not exist/i.test(stderr)) return 'NOT_FOUND'
  if (/already exists|exists/i.test(stderr)) return 'ALREADY_EXISTS'
  if (/not running|already stopped/i.test(stderr)) return 'NOT_RUNNING'
  return String(exitCode)
}

/** Run `container <args>`; throws RuntimeError on nonzero exit or timeout. */
export async function runtimeCli(args: string[], options?: CliOptions): Promise<CliResult> {
  const timeoutMs = options?.timeoutMs ?? CLI_DEFAULT_TIMEOUT_MS
  const proc = Bun.spawn([CONTAINER_BIN, ...args], { stdout: 'pipe', stderr: 'pipe' })

  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    proc.kill()
  }, timeoutMs)

  try {
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ])

    if (timedOut) {
      throw new RuntimeError(`container ${args[0]} timed out after ${timeoutMs}ms`, 'TIMEOUT')
    }

    if (exitCode !== 0) {
      const tail = stderr.trim().split('\n').slice(-3).join(' ') || `exit ${exitCode}`
      logger.debug({ args, exitCode, stderr: tail }, 'runtime CLI failed')
      throw new RuntimeError(`container ${args.join(' ')}: ${tail}`, classifyError(stderr, exitCode))
    }

    return { stdout, stderr }
  } finally {
    clearTimeout(timer)
  }
}

/** runtimeCli + JSON parse; unwraps one-element arrays when expectSingle. */
export async function runtimeCliJson<T>(
  args: string[],
  options?: CliOptions & { expectSingle?: boolean },
): Promise<T> {
  const { stdout } = await runtimeCli(args, options)
  let parsed: unknown
  try {
    parsed = JSON.parse(stdout)
  } catch {
    throw new RuntimeError(`container ${args.join(' ')}: unparseable JSON output`, 'BAD_JSON')
  }
  if (options?.expectSingle && Array.isArray(parsed)) {
    return parsed[0] as T
  }
  return parsed as T
}

/** Spawn without waiting — for `logs -f`. Caller owns the child process. */
export function spawnRuntimeCli(args: string[]) {
  return Bun.spawn([CONTAINER_BIN, ...args], { stdout: 'pipe', stderr: 'pipe' })
}

/** Async generator of lines from a byte stream (flushes the trailing chunk). */
export async function* readLines(stream: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const decoder = new TextDecoder()
  let buffer = ''
  for await (const chunk of stream) {
    buffer += decoder.decode(chunk, { stream: true })
    let newline = buffer.indexOf('\n')
    while (newline !== -1) {
      yield buffer.slice(0, newline)
      buffer = buffer.slice(newline + 1)
      newline = buffer.indexOf('\n')
    }
  }
  buffer += decoder.decode()
  if (buffer.length > 0) {
    yield buffer
  }
}
