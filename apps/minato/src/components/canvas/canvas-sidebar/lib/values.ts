import { IconCloud, IconKey, IconNetwork, IconVolume } from '@tabler/icons-react'
import type { ComingSoonItem, ServiceCatalogItem } from './types'

export const SERVICE_CATALOG_ITEMS: ServiceCatalogItem[] = [
  {
    name: 'Custom Service',
    description: 'Deploy from Docker image',
    dragData: { sourceType: 'image' },
    addParams: {
      name: 'Custom Service',
      sourceType: 'image',
      sourceConfig: { image: 'nginx', tag: 'latest' },
    },
  },
  {
    name: 'Git Repository',
    description: 'Deploy from Git repository',
    dragData: { sourceType: 'git' },
    addParams: {
      name: 'Git Repository',
      sourceType: 'git',
      sourceConfig: { repository: 'https://github.com/example/repo' },
    },
  },
]

export const COMING_SOON_ITEMS: ComingSoonItem[] = [
  { icon: IconVolume, label: 'volumes' },
  { icon: IconNetwork, label: 'networks' },
  { icon: IconKey, label: 'secrets & env' },
  { icon: IconCloud, label: 'external' },
]
