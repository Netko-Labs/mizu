import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useWorkspace } from '@/components/core/workspace'
import { projectQueries } from '@/shared/api'

export function useProjectsDashboard() {
  const { currentWorkspace, isLoading: isWorkspaceLoading } = useWorkspace()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: projects = [], isLoading } = useQuery({
    ...projectQueries.list(currentWorkspace?.id ?? ''),
    enabled: Boolean(currentWorkspace),
  })

  const query = searchQuery.trim().toLowerCase()
  const filteredProjects = query
    ? projects.filter(
        (p) => p.name.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query),
      )
    : projects

  return {
    currentWorkspace,
    isWorkspaceLoading,
    isLoading,
    projects,
    filteredProjects,
    isFiltered: Boolean(query),
    searchQuery,
    setSearchQuery,
  }
}
