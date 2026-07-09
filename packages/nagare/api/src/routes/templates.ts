import { TemplateCategorySchema } from '@mizu/nagare-domain'
import { allTemplates, getTemplateById, getTemplatesByCategory } from '@mizu/nagare-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

export const templatesRoutes = new Elysia({ name: 'templates', prefix: '/templates' })
  .use(authPlugin)
  // (｡◕‿◕｡) the full template catalog
  .get('/', { auth: true }, () => allTemplates)
  // (｡◕‿◕｡) templates in one category
  .get('/category/:category', { auth: true, params: TemplateCategorySchema }, ({ params }) =>
    getTemplatesByCategory(params.category),
  )
  // (・o・)ゞ one template by id
  .get('/:templateId', { auth: true }, ({ params }) => getTemplateById(params.templateId))
