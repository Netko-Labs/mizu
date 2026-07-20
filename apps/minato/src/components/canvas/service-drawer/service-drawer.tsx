import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConsoleTab } from './console-tab'
import { DeploymentsTab } from './deployments-tab'
import { FilesTab } from './files-tab'
import { type DrawerTab, type ServiceDrawerProps, TAB_DEFINITIONS, useServiceDrawer } from './lib'
import { LogsTab } from './logs-tab'
import { MetricsTab } from './metrics-tab'
import { DatabaseOverview, OverviewTab } from './overview-tab'
import { ServiceDrawerHeader } from './service-drawer-header'
import { SettingsTab } from './settings-tab'
import { VariablesTab } from './variables-tab'

/**
 * The Railway-style service drawer: a wide, non-modal tabbed panel floating
 * over the canvas. Overview + Settings ship first; Deployments / Variables /
 * Metrics / Logs land as their data tabs come online.
 */
export function ServiceDrawer({
  nodeId,
  nodeType,
  service,
  database,
  projectSlug,
  initialTab,
  onClose,
  onAction,
  isActionPending,
}: ServiceDrawerProps) {
  const { tab, setTab } = useServiceDrawer({ nodeId, initialTab })
  if (!nodeType || (!service && !database)) return null

  const tabs = TAB_DEFINITIONS.filter((t) => t.appliesTo.includes(nodeType))

  return (
    <div className="flex h-full flex-col">
      <ServiceDrawerHeader
        nodeType={nodeType}
        service={service}
        database={database}
        onClose={onClose}
        onAction={onAction}
        isActionPending={isActionPending}
      />
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as DrawerTab)}
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <TabsList
          variant="line"
          className="w-full justify-start gap-2.5 overflow-x-auto border-b border-border px-3"
        >
          {tabs.map(({ id, label, icon: TabIcon, implemented }) => (
            <TabsTrigger
              key={id}
              value={id}
              disabled={!implemented}
              className="flex-none px-1 py-2 text-xs"
            >
              <TabIcon className="size-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="min-h-0">
          <ScrollArea className="h-full">
            {nodeType === 'service' && service ? (
              <OverviewTab service={service} projectSlug={projectSlug} onAction={onAction} />
            ) : database ? (
              <DatabaseOverview database={database} onAction={onAction} />
            ) : null}
          </ScrollArea>
        </TabsContent>

        {nodeType === 'service' && service && (
          <TabsContent value="deployments" className="min-h-0">
            <ScrollArea className="h-full">
              <DeploymentsTab service={service} />
            </ScrollArea>
          </TabsContent>
        )}

        {nodeType === 'service' && service && (
          <TabsContent value="variables" className="min-h-0">
            <VariablesTab service={service} onAction={onAction} />
          </TabsContent>
        )}

        {nodeType === 'service' && service && (
          <TabsContent value="metrics" className="min-h-0">
            <ScrollArea className="h-full">
              <MetricsTab service={service} />
            </ScrollArea>
          </TabsContent>
        )}

        <TabsContent value="logs" className="min-h-0">
          <LogsTab nodeType={nodeType} entityId={nodeId} />
        </TabsContent>

        {nodeType === 'service' && service && (
          <TabsContent value="console" className="min-h-0">
            <ConsoleTab service={service} />
          </TabsContent>
        )}

        {nodeType === 'service' && service && (
          <TabsContent value="files" className="min-h-0">
            <FilesTab service={service} />
          </TabsContent>
        )}

        <TabsContent value="settings" className="min-h-0">
          <ScrollArea className="h-full">
            <SettingsTab
              nodeType={nodeType}
              service={service}
              database={database}
              projectSlug={projectSlug}
              onAction={onAction}
              isActionPending={isActionPending}
            />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
