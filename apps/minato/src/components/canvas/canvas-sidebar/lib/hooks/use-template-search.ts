import { databaseTemplates, serviceTemplates } from '@mizu/nagare-domain'
import { useMemo, useState } from 'react'
import type { TemplateSearchResult } from '../types'

/**
 * Search state for the sidebar template catalogs: filters the database and
 * service templates by the current query and derives section visibility.
 */
export function useTemplateSearch(): TemplateSearchResult {
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
  const noResults = Boolean(
    searchQuery.trim() &&
      filteredDatabaseTemplates.length === 0 &&
      filteredServiceTemplates.length === 0,
  )

  return {
    searchQuery,
    setSearchQuery,
    filteredDatabaseTemplates,
    filteredServiceTemplates,
    showServices,
    showDatabases,
    showTemplates,
    noResults,
  }
}
