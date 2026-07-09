export * from './database-templates'
export * from './service-templates'
export * from './types'

import { databaseTemplates } from './database-templates'
import { serviceTemplates } from './service-templates'
import type { ServiceTemplate } from './types'

export const allTemplates: ServiceTemplate[] = [...databaseTemplates, ...serviceTemplates]

export const getTemplateById = (id: string): ServiceTemplate | undefined =>
  allTemplates.find((t) => t.id === id)

export const getTemplatesByCategory = (category: ServiceTemplate['category']): ServiceTemplate[] =>
  allTemplates.filter((t) => t.category === category)
