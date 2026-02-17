import { databaseTemplates, serviceTemplates } from '@mizu/minato-service/templates'
import {
  IconApps,
  IconCloud,
  IconDatabase,
  IconKey,
  IconNetwork,
  IconServer,
  IconVolume,
} from '@tabler/icons-react'
import { type DragEvent, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface DraggableItemProps {
  type: 'service' | 'database' | 'volume' | 'network' | 'secret' | 'external'
  data: Record<string, unknown>
  children: React.ReactNode
  onClick?: () => void
}

/**
 * A draggable item component that can be dropped onto the canvas.
 * Also supports click-to-add as a reliable alternative to drag-and-drop.
 */
function DraggableItem({ type, data, children, onClick }: DraggableItemProps) {
  const onDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/reactflow-type', type)
    e.dataTransfer.setData('application/reactflow-data', JSON.stringify(data))
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.()
      }}
      className="cursor-pointer active:cursor-grabbing"
    >
      {children}
    </div>
  )
}

interface SidebarSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

/**
 * Collapsible section in the sidebar
 */
function SidebarSection({ title, icon, children, defaultOpen = true }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-neutral-700 hover:text-neutral-500 transition-colors">
        <span className="flex items-center gap-2">
          {icon}
          <span># {title.toLowerCase()}</span>
        </span>
        <svg
          className={cn('ml-auto size-4 transition-transform duration-200', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2">{children}</CollapsibleContent>
    </Collapsible>
  )
}

interface ServiceItemCardProps {
  name: string
  description: string
  className?: string
}

/**
 * Card component for sidebar items
 */
function ServiceItemCard({ name, description, className }: ServiceItemCardProps) {
  return (
    <Card
      className={cn(
        'border-neutral-800 bg-neutral-950 p-3 transition-all hover:border-neutral-700 hover:bg-neutral-900',
        className,
      )}
    >
      <div className="text-xs font-medium text-neutral-300">{name}</div>
      <div className="text-[10px] text-neutral-600 line-clamp-2">{description}</div>
    </Card>
  )
}

export interface CanvasSidebarProps {
  className?: string
  onAddService?: (params: {
    name: string
    sourceType: 'image' | 'git' | 'template'
    sourceConfig: Record<string, unknown>
  }) => void
  onAddDatabase?: (params: {
    name: string
    type: 'postgres' | 'mysql' | 'redis' | 'mongodb' | 'mariadb'
    version?: string
  }) => void
}

/**
 * Canvas sidebar component for adding services and databases to the canvas
 * Items can be clicked or dragged onto the canvas
 */
export function CanvasSidebar({ className, onAddService, onAddDatabase }: CanvasSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter templates based on search query
  const filteredDatabaseTemplates = useMemo(() => {
    if (!searchQuery.trim()) return databaseTemplates
    const query = searchQuery.toLowerCase()
    return databaseTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.databaseType.toLowerCase().includes(query),
    )
  }, [searchQuery])

  const filteredServiceTemplates = useMemo(() => {
    if (!searchQuery.trim()) return serviceTemplates
    const query = searchQuery.toLowerCase()
    return serviceTemplates.filter(
      (t) => t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query),
    )
  }, [searchQuery])

  const showServices = !searchQuery.trim() || filteredServiceTemplates.length > 0
  const showDatabases = !searchQuery.trim() || filteredDatabaseTemplates.length > 0
  const showTemplates = !searchQuery.trim() || filteredServiceTemplates.length > 0
  const noResults =
    searchQuery.trim() &&
    filteredDatabaseTemplates.length === 0 &&
    filteredServiceTemplates.length === 0

  return (
    <div className={cn('flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-black font-mono', className)}>
      {/* Search header */}
      <div className="border-b border-neutral-800 p-4">
        <div className="flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1.5">
          <span className="text-[10px] text-neutral-700">$ grep</span>
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
              <DraggableItem
                type="service"
                data={{ sourceType: 'image' }}
                onClick={() =>
                  onAddService?.({
                    name: 'Custom Service',
                    sourceType: 'image',
                    sourceConfig: { image: 'nginx', tag: 'latest' },
                  })
                }
              >
                <ServiceItemCard name="Custom Service" description="Deploy from Docker image" />
              </DraggableItem>
              <DraggableItem
                type="service"
                data={{ sourceType: 'git' }}
                onClick={() =>
                  onAddService?.({
                    name: 'Git Repository',
                    sourceType: 'git',
                    sourceConfig: { repository: 'https://github.com/example/repo' },
                  })
                }
              >
                <ServiceItemCard name="Git Repository" description="Deploy from Git repository" />
              </DraggableItem>
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
                      type: template.databaseType as
                        | 'postgres'
                        | 'mysql'
                        | 'redis'
                        | 'mongodb'
                        | 'mariadb',
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
                  }}
                  onClick={() =>
                    onAddService?.({
                      name: template.name,
                      sourceType: 'template',
                      sourceConfig: { templateId: template.id, overrides: {} },
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
            <div className="flex items-center gap-2 px-2 py-1.5">
              <IconVolume className="size-4 text-neutral-700" />
              <span className="text-xs text-neutral-700"># volumes</span>
              <span className="ml-auto rounded border border-neutral-800 px-1.5 py-0.5 text-[9px] text-neutral-700">
                soon
              </span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <IconNetwork className="size-4 text-neutral-700" />
              <span className="text-xs text-neutral-700"># networks</span>
              <span className="ml-auto rounded border border-neutral-800 px-1.5 py-0.5 text-[9px] text-neutral-700">
                soon
              </span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <IconKey className="size-4 text-neutral-700" />
              <span className="text-xs text-neutral-700"># secrets & env</span>
              <span className="ml-auto rounded border border-neutral-800 px-1.5 py-0.5 text-[9px] text-neutral-700">
                soon
              </span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <IconCloud className="size-4 text-neutral-700" />
              <span className="text-xs text-neutral-700"># external</span>
              <span className="ml-auto rounded border border-neutral-800 px-1.5 py-0.5 text-[9px] text-neutral-700">
                soon
              </span>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
