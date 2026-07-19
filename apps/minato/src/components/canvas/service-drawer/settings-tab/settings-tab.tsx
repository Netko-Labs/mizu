import { useState } from 'react'
import { EditablePropertyLine, PropertyLine } from '@/components/canvas/shared'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { SettingsTabProps } from './lib/types'

/** Settings: rename + info rows + danger zone delete. */
export function SettingsTab({
  nodeType,
  service,
  database,
  onAction,
  isActionPending,
}: SettingsTabProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const entity = nodeType === 'service' ? service : database
  if (!entity) return null

  return (
    <div className="space-y-4 p-4">
      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-sm">General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <EditablePropertyLine
            label="name"
            value={entity.name}
            onSave={(name) => onAction?.({ type: 'updateName', name })}
          />
          <PropertyLine label="id" value={entity.id} mono copyable />
          <PropertyLine label="created" value={new Date(entity.createdAt).toLocaleString()} />
          <PropertyLine label="updated" value={new Date(entity.updatedAt).toLocaleString()} />
        </CardContent>
      </Card>

      <Card size="sm" className="ring-destructive/30">
        <CardHeader>
          <CardTitle className="text-sm text-destructive">Danger zone</CardTitle>
          <CardDescription className="text-xs">
            Deleting removes the {nodeType}, its container, and its connections. This cannot be
            undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            size="sm"
            disabled={isActionPending}
            onClick={() => setConfirmOpen(true)}
          >
            Delete {nodeType}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {entity.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the {nodeType} and its container. There is no undo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setConfirmOpen(false)
                onAction?.({ type: 'delete' })
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
