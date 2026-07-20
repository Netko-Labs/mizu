import { IconAdjustments, IconCode, IconFolders, IconHistory, IconX } from '@tabler/icons-react'
import { ActivityFeed } from '@/components/canvas/activity-feed'
import { YamlPreviewPanel } from '@/components/canvas/yaml-preview'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ProjectDrawerProps, ProjectDrawerTab } from './lib/types'
import { ProjectSettingsForm } from './project-settings-form'

/**
 * Project-level config panel — the drawer counterpart for everything that
 * isn't a single service: settings, the generated mizu.yml, and the activity
 * trail.
 */
export function ProjectDrawer({
  project,
  tab,
  onTabChange,
  mizuYaml,
  onClose,
}: ProjectDrawerProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <IconFolders className="size-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground">{project.name}</div>
          <div className="text-[11px] text-muted-foreground">Project configuration</div>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
          <IconX className="size-3.5" />
        </Button>
      </div>
      <Tabs
        value={tab}
        onValueChange={(value) => onTabChange(value as ProjectDrawerTab)}
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <TabsList
          variant="line"
          className="w-full justify-start gap-2.5 border-b border-border px-3"
        >
          <TabsTrigger value="settings" className="flex-none px-1 py-2 text-xs">
            <IconAdjustments className="size-3.5" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="yaml" className="flex-none px-1 py-2 text-xs">
            <IconCode className="size-3.5" />
            mizu.yml
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex-none px-1 py-2 text-xs">
            <IconHistory className="size-3.5" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="min-h-0">
          <ScrollArea className="h-full">
            <ProjectSettingsForm project={project} />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="yaml" className="min-h-0">
          <div className="h-full overflow-auto p-3">
            <YamlPreviewPanel mizuYaml={mizuYaml} />
          </div>
        </TabsContent>

        <TabsContent value="activity" className="min-h-0">
          <ActivityFeed projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
