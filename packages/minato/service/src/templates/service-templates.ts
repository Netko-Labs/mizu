import type { ServiceTemplate } from './types'

/**
 * Service templates for common utility and tool services
 */
export const serviceTemplates: ServiceTemplate[] = [
  {
    id: 'adminer',
    name: 'Adminer',
    description: 'Database management in a single PHP file',
    category: 'tool',
    sourceType: 'image',
    sourceConfig: { image: 'adminer', tag: 'latest' },
    defaultPorts: [{ container: 8080 }],
    defaultEnvVars: {
      ADMINER_DEFAULT_SERVER: '',
    },
  },
]
