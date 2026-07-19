import { IconApps, IconDatabase, IconServer } from '@tabler/icons-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { DraggableItem, ServiceItemCard } from './canvas-sidebar-item'
import { SidebarSection } from './canvas-sidebar-section'
import { COMING_SOON_ITEMS, SERVICE_CATALOG_ITEMS, useTemplateSearch } from './lib'
import type { CanvasSidebarProps } from './lib/types'

/**
 * Canvas sidebar component for adding services and databases to the canvas
 * Items can be clicked or dragged onto the canvas
 */
export function CanvasSidebar({ className, onAddService, onAddDatabase }: CanvasSidebarProps) {
  const {
    searchQuery,
    setSearchQuery,
    filteredDatabaseTemplates,
    filteredServiceTemplates,
    showServices,
    showDatabases,
    showTemplates,
    noResults,
  } = useTemplateSearch()

  return (
    <div
      className={cn(
        'flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-black font-mono',
        className,
      )}
    >
      {/* Search header */}
      <div className="border-b border-neutral-800 p-4">
        <div className="flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1.5">
          <span className="text-[10px] text-neutral-600">Search</span>
          <Input
            placeholder="search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-6 border-0 bg-transparent px-0 text-xs text-neutral-300 placeholder:text-neutral-700 focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="p-4 space-y-4">
          {noResults && (
            <div className="py-8 text-center">
              <p className="text-xs text-neutral-500">no results found</p>
              <p className="mt-1 text-[10px] text-neutral-700">$ try a different query</p>
            </div>
          )}

          {/* Services Section */}
          {showServices && (
            <SidebarSection title="Services" icon={<IconServer className="size-4" />}>
              {SERVICE_CATALOG_ITEMS.map((item) => (
                <DraggableItem
                  key={item.name}
                  type="service"
                  data={item.dragData}
                  onClick={() => onAddService?.(item.addParams)}
                >
                  <ServiceItemCard name={item.name} description={item.description} />
                </DraggableItem>
              ))}
            </SidebarSection>
          )}

          {showServices && showDatabases && <Separator />}

          {/* Databases Section */}
          {showDatabases && (
            <SidebarSection title="Databases" icon={<IconDatabase className="size-4" />}>
              {filteredDatabaseTemplates.map((template) => (
                <DraggableItem
                  key={template.id}
                  type="database"
                  data={{
                    templateId: template.id,
                    databaseType: template.databaseType,
                    name: template.name,
                  }}
                  onClick={() =>
                    onAddDatabase?.({
                      name: template.name,
                      type: template.databaseType,
                      version: template.sourceConfig.tag?.split('-')[0],
                    })
                  }
                >
                  <ServiceItemCard name={template.name} description={template.description} />
                </DraggableItem>
              ))}
            </SidebarSection>
          )}

          {(showServices || showDatabases) && showTemplates && <Separator />}

          {/* One-Click Apps Section */}
          {showTemplates && filteredServiceTemplates.length > 0 && (
            <SidebarSection title="One-Click Apps" icon={<IconApps className="size-4" />}>
              {filteredServiceTemplates.map((template) => (
                <DraggableItem
                  key={template.id}
                  type="service"
                  data={{
                    sourceType: 'template',
                    templateId: template.id,
                    name: template.name,
                    createAsGroup: true,
                  }}
                  onClick={() =>
                    onAddService?.({
                      name: template.name,
                      sourceType: 'template',
                      sourceConfig: {
                        templateId: template.id,
                        overrides: {},
                        // biome-ignore lint/style/useNamingConvention: underscore marks a transient client-side flag stripped before the API call
                        _createAsGroup: true,
                      },
                    })
                  }
                >
                  <ServiceItemCard name={template.name} description={template.description} />
                </DraggableItem>
              ))}
            </SidebarSection>
          )}

          <Separator />

          {/* Coming Soon sections */}
          <div className="space-y-2 opacity-50">
            {COMING_SOON_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-2 px-2 py-1.5">
                <item.icon className="size-4 text-neutral-700" />
                <span className="text-xs text-neutral-600">{item.label}</span>
                <span className="ml-auto rounded border border-neutral-800 px-1.5 py-0.5 text-[9px] text-neutral-700">
                  soon
                </span>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
