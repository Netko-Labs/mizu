import { getAvailableApps, parseAppArg, validateApp } from '../utils/apps'
import { requireAppleContainer } from '../utils/container-runtime'
import { run } from '../utils/shell'

/**
 * ✧･ﾟ: *✧･ﾟ:* LOGS COMMANDS *:･ﾟ✧*:･ﾟ✧
 *
 * View infra container logs for an app (◕‿◕✿)
 */

/**
 * View infra container logs (the shared Postgres by default, or
 * --service=<container-name> for any container)
 */
export async function logs(args: string[]) {
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

  requireAppleContainer()

  const follow = args.includes('--follow') || args.includes('-f')
  const serviceArg = args.find((a) => a.startsWith('--service='))
  const container = serviceArg?.split('=')[1] || 'mizu-db-minato'
  const tailArg = args.find((a) => a.startsWith('--tail='))
  const tail = tailArg?.split('=')[1] || '100'

  const command = ['container', 'logs', '-n', tail]
  if (follow) {
    command.push('-f')
  }
  command.push(container)

  console.log(`📋 Showing logs for ${container}...\n`)

  await run(command)
}
