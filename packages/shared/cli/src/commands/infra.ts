import { getAvailableApps, parseAppArg, validateApp } from '../utils/apps'
import { requireAppleContainer, tryRun } from '../utils/container-runtime'
import { run } from '../utils/shell'

/**
 * ✧･ﾟ: *✧･ﾟ:* INFRA COMMANDS *:･ﾟ✧*:･ﾟ✧
 *
 * Dev infra on Apple's `container` runtime (◕‿◕✿) — the one shared Postgres
 * both apps use. No docker, no compose: mizu is apple-container-first.
 */

const DB_CONTAINER = 'mizu-db-minato'
const DB_IMAGE = 'docker.io/library/postgres:17'
const DB_PORT = process.env.MINATO_DB_PORT ?? '19432'
const DB_VOLUME = 'mizu-postgres-data'

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
 * Start infra containers for an app (the shared Postgres)
 */
export async function infraUp(args: string[]) {
  const appName = requireApp(args)
  requireAppleContainer()

  console.log(`🍎 Starting infra for ${appName}...`)

  // Idempotent: starts the API server + Linux kernel on first use
  await run(['container', 'system', 'start'])

  if (tryRun(['sh', '-c', `container ls | grep -q ${DB_CONTAINER}`])) {
    console.log('   Postgres already running')
  } else if (tryRun(['container', 'inspect', DB_CONTAINER])) {
    await run(['container', 'start', DB_CONTAINER])
  } else {
    tryRun(['container', 'volume', 'create', DB_VOLUME])
    await run([
      'container',
      'run',
      '--detach',
      '--name',
      DB_CONTAINER,
      // On macOS 26.1+, Apple `container` published-port forwarding is broken
      // (apple/container#919); the mizu host-forwarder binds these ports
      // instead, so skip the container publish to leave them free.
      ...(process.env.MIZU_HOST_FORWARD ? [] : ['--publish', `${DB_PORT}:5432`]),
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
      `${DB_VOLUME}:/var/lib/postgresql/data`,
      DB_IMAGE,
    ])
  }

  console.log(`✅ Infra for ${appName} is running!`)
}

/**
 * Stop infra containers for an app
 */
export async function infraDown(args: string[]) {
  const appName = requireApp(args)
  requireAppleContainer()

  console.log(`🍎 Stopping infra for ${appName}...`)
  tryRun(['container', 'stop', DB_CONTAINER])
  console.log(`✅ Infra for ${appName} stopped!`)
}
