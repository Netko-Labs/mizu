import { getAppDir, getAvailableApps, parseAppArg, validateApp } from '../utils/apps'
import { getContainerRuntime, tryRun } from '../utils/container-runtime'
import { run } from '../utils/shell'

/**
 * ✧･ﾟ: *✧･ﾟ:* CONTAINER COMMANDS *:･ﾟ✧*:･ﾟ✧
 *
 * Infra containers with runtime detection (◕‿◕✿):
 * - Docker present  → `docker compose` with profiles (full experience,
 *   including nagare's dockerode deploy engine).
 * - Apple `container` only → runs the one shared Postgres directly. Deploys
 *   from the canvas still need Docker; the dev stack itself does not.
 */

const APPLE_DB_CONTAINER = 'mizu-db-minato'
const APPLE_DB_IMAGE = 'docker.io/library/postgres:17'
const APPLE_DB_PORT = process.env.MINATO_DB_PORT ?? '19432'
// Named volume, not a bind mount: postgres chowns its data dir, which
// virtiofs bind mounts refuse under Apple container.
const APPLE_DB_VOLUME = 'mizu-postgres-data'

function requireApp(args: string[]): string {
  const appName = parseAppArg(args)

  if (!appName) {
    console.error('❌ Please specify an app with --app <name>')
    console.log(`Available apps: ${getAvailableApps().join(', ')}`)
    process.exit(1)
  }

  if (!validateApp(appName)) {
    console.error(`❌ App "${appName}" not found`)
    console.log(`Available apps: ${getAvailableApps().join(', ')}`)
    process.exit(1)
  }

  return appName
}

/**
 * Start infra containers for an app
 */
export async function dockerUp(args: string[]) {
  const appName = requireApp(args)
  const runtime = getContainerRuntime()

  if (runtime === 'docker') {
    console.log(`🐳 Starting Docker containers for ${appName}...`)
    await run(['docker', 'compose', '--profile', appName, 'up', '-d'], {
      cwd: getAppDir(appName),
    })
    console.log(`✅ Docker containers for ${appName} are running!`)
    return
  }

  if (runtime === 'apple') {
    console.log(`🍎 Starting Apple containers for ${appName}...`)
    await appleUp()
    console.log(`✅ Apple containers for ${appName} are running!`)
    console.log('   ℹ canvas deploys need Docker; the shared Postgres is enough for the dev stack')
    return
  }

  console.error('❌ No container runtime found — install Docker or Apple `container` (macOS 26+)')
  process.exit(1)
}

/**
 * Stop infra containers for an app
 */
export async function dockerDown(args: string[]) {
  const appName = requireApp(args)
  const runtime = getContainerRuntime()

  if (runtime === 'docker') {
    console.log(`🐳 Stopping Docker containers for ${appName}...`)
    await run(['docker', 'compose', '--profile', appName, 'down'], {
      cwd: getAppDir(appName),
    })
    console.log(`✅ Docker containers for ${appName} stopped!`)
    return
  }

  if (runtime === 'apple') {
    console.log(`🍎 Stopping Apple containers for ${appName}...`)
    tryRun(['container', 'stop', APPLE_DB_CONTAINER])
    console.log(`✅ Apple containers for ${appName} stopped!`)
    return
  }

  console.error('❌ No container runtime found — install Docker or Apple `container` (macOS 26+)')
  process.exit(1)
}

/**
 * The Apple-runtime equivalent of the compose file: the one shared Postgres
 * both apps use, persisted under ~/.mizu/devbox/postgres.
 */
async function appleUp() {
  // Idempotent: starts the API server + Linux kernel on first use
  await run(['container', 'system', 'start'])

  // Already running?
  if (tryRun(['sh', '-c', `container ls | grep -q ${APPLE_DB_CONTAINER}`])) {
    console.log('   Postgres already running')
    return
  }

  // Exists but stopped?
  if (tryRun(['container', 'inspect', APPLE_DB_CONTAINER])) {
    await run(['container', 'start', APPLE_DB_CONTAINER])
    return
  }

  // Idempotent volume create (fails harmlessly when it already exists)
  tryRun(['container', 'volume', 'create', APPLE_DB_VOLUME])
  await run([
    'container',
    'run',
    '--detach',
    '--name',
    APPLE_DB_CONTAINER,
    '--publish',
    `${APPLE_DB_PORT}:5432`,
    '--env',
    'POSTGRES_USER=postgres',
    '--env',
    'POSTGRES_PASSWORD=postgres',
    '--env',
    'POSTGRES_DB=mizu',
    // The ext4 volume root holds lost+found, which initdb refuses — use a subdir
    '--env',
    'PGDATA=/var/lib/postgresql/data/pgdata',
    '--volume',
    `${APPLE_DB_VOLUME}:/var/lib/postgresql/data`,
    APPLE_DB_IMAGE,
  ])
}
