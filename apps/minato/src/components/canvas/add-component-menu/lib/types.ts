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

export interface AddComponentMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddService?: (params: AddServiceParams) => void
  onAddDatabase?: (params: AddDatabaseParams) => void
}
