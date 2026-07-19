import type { DatabaseType } from '@mizu/nagare-domain'
import { EditablePropertyLine, PropertyLine } from '@/components/canvas/shared'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DATABASE_TYPE_LABELS } from '../lib'
import { type DatabaseOverviewProps, parseDatabaseCredentials } from './lib'

/** Database Overview: engine + connection + container cards. */
export function DatabaseOverview({ database, onAction }: DatabaseOverviewProps) {
  const dbType = database.type as DatabaseType
  const creds = parseDatabaseCredentials(database.credentials)

  const saveCredential = (
    patch: Partial<{ username: string; password: string; database: string }>,
  ) =>
    onAction?.({
      type: 'updateCredentials',
      credentials: {
        username: creds?.username ?? '',
        password: creds?.password ?? '',
        database: creds?.database ?? '',
        ...patch,
      },
    })

  return (
    <div className="space-y-4 p-4">
      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-sm">Database</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <PropertyLine label="engine" value={DATABASE_TYPE_LABELS[dbType] ?? dbType} accent />
          {database.version && <PropertyLine label="version" value={`v${database.version}`} />}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-sm">Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <PropertyLine label="host" value="localhost" mono copyable />
          <PropertyLine label="port" value={database.port} mono copyable />
          <EditablePropertyLine
            label="user"
            value={creds?.username ?? ''}
            onSave={(username) => saveCredential({ username })}
          />
          <EditablePropertyLine
            label="password"
            value={creds?.password ?? ''}
            onSave={(password) => saveCredential({ password })}
          />
          <EditablePropertyLine
            label="database"
            value={creds?.database ?? ''}
            onSave={(name) => saveCredential({ database: name })}
          />
        </CardContent>
      </Card>

      {database.containerId && (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm">Container</CardTitle>
          </CardHeader>
          <CardContent>
            <PropertyLine label="id" value={database.containerId} mono copyable />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
