export interface DashboardHeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  searchDisabled?: boolean
  showToolbar?: boolean
}

export interface DashboardStatlineProps {
  workspaceName: string
  projectCount: number
}

export interface DashboardEmptyProps {
  isFiltered: boolean
}
