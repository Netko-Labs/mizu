import type { DatabaseTemplate, ServiceTemplate } from '@mizu/nagare-domain'
import type { Icon } from '@tabler/icons-react'
import type { ReactNode } from 'react'

export interface AddServiceParams {
  name: string
  sourceType: 'image' | 'git' | 'template'
  sourceConfig: Record<string, unknown>
}

export interface AddDatabaseParams {
  name: string
  type: 'postgres' | 'mysql' | 'redis' | 'mongodb' | 'mariadb'
  version?: string
}

export interface DraggableItemProps {
  type: 'service' | 'database' | 'volume' | 'network' | 'secret' | 'external'
  data: Record<string, unknown>
  children: ReactNode
  onClick?: () => void
}

export interface SidebarSectionProps {
  title: string
  icon: ReactNode
  children: ReactNode
  defaultOpen?: boolean
}

export interface ServiceItemCardProps {
  name: string
  description: string
  className?: string
}

export interface CanvasSidebarProps {
  className?: string
  onAddService?: (params: AddServiceParams) => void
  onAddDatabase?: (params: AddDatabaseParams) => void
}

export interface ServiceCatalogItem {
  name: string
  description: string
  dragData: Record<string, unknown>
  addParams: AddServiceParams
}

export interface ComingSoonItem {
  icon: Icon
  label: string
}

export interface TemplateSearchResult {
  searchQuery: string
  setSearchQuery: (query: string) => void
  filteredDatabaseTemplates: DatabaseTemplate[]
  filteredServiceTemplates: ServiceTemplate[]
  showServices: boolean
  showDatabases: boolean
  showTemplates: boolean
  noResults: boolean
}
