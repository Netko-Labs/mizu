import type { PortMapping, ServiceSettings } from '@mizu/nagare-domain'
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
import { Switch } from '@/components/ui/switch'
import { useIngressUrl } from '../lib'
import type { SettingsTabProps } from './lib/types'
import { ServiceIngressEditor } from './service-ingress-editor'

/** Grouped config: General / Source / Networking / Danger zone. */
export function SettingsTab({
  nodeType,
  service,
  database,
  projectSlug,
  onAction,
  isActionPending,
}: SettingsTabProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const entity = nodeType === 'service' ? service : database
  const sourceConfig = (service?.sourceConfig ?? {}) as Record<string, unknown>
  const ports = ((service?.ports ?? []) as PortMapping[]).map((p) => p.container)
  const serviceSettings = (service?.settings ?? {}) as ServiceSettings
  const ingressRules = serviceSettings.ingressRules ?? []
  const exposed = serviceSettings.exposed === true
  const autoUrl = useIngressUrl(
    service?.name ?? '',
    projectSlug,
    !!service &&
      service.status === 'running' &&
      exposed &&
      ports.length > 0 &&
      ingressRules.length === 0,
  )
  if (!entity) return null

  // Always merge from the current settings so one key never clobbers another.
  const saveSettings = (patch: Partial<ServiceSettings>) =>
    onAction?.({ type: 'updateSettings', settings: { ...serviceSettings, ...patch } })

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

      {nodeType === 'service' && service && service.sourceType === 'image' && (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm">Source</CardTitle>
            <CardDescription className="text-xs">Changes apply on the next deploy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <EditablePropertyLine
              label="image"
              value={(sourceConfig.image as string) ?? ''}
              onSave={(image) =>
                onAction?.({
                  type: 'updateSourceConfig',
                  sourceConfig: { image, tag: sourceConfig.tag as string | undefined },
                })
              }
            />
            <EditablePropertyLine
              label="tag"
              value={(sourceConfig.tag as string) ?? 'latest'}
              onSave={(tag) =>
                onAction?.({
                  type: 'updateSourceConfig',
                  sourceConfig: { image: sourceConfig.image as string, tag },
                })
              }
            />
          </CardContent>
        </Card>
      )}

      {nodeType === 'service' && service && (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm">Networking</CardTitle>
            <CardDescription className="text-xs">
              Services are private by default. Expose publicly for the auto host, or add ingress
              rules (rules replace the auto host and expose on their own).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-md border border-border bg-background/60 px-2.5 py-2">
              <div className="text-xs text-foreground/90">
                Expose publicly
                <div className="text-[11px] text-muted-foreground">
                  {exposed
                    ? 'Reachable at the auto-derived host'
                    : ingressRules.length > 0
                      ? 'Private auto host — ingress rules still apply'
                      : 'Only reachable inside the project network'}
                </div>
              </div>
              <Switch
                checked={exposed}
                onCheckedChange={(checked) => saveSettings({ exposed: checked })}
                disabled={isActionPending}
              />
            </div>
            <ServiceIngressEditor
              rules={ingressRules}
              ports={ports}
              running={service.status === 'running'}
              autoUrl={autoUrl}
              onChange={(rules) => saveSettings({ ingressRules: rules })}
            />
          </CardContent>
        </Card>
      )}

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
