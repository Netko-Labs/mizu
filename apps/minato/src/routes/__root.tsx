import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { NotFound, RootDocument } from '@/components/core/root'

import appCss from '../styles.css?url'
import '@xyflow/react/dist/style.css'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Mizu — Self-hosting Platform' },
      {
        name: 'description',
        content:
          'Deploy your apps like water flows. A visual self-hosting platform for macOS home labs.',
      },
      { name: 'theme-color', content: '#000000' },
      { name: 'color-scheme', content: 'dark' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'Mizu — Self-hosting Platform' },
      {
        property: 'og:description',
        content:
          'Deploy your apps like water flows. A visual self-hosting platform for macOS home labs.',
      },
      { property: 'og:site_name', content: 'Mizu' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' },
      { rel: 'icon', href: '/logo192.png', type: 'image/png', sizes: '192x192' },
      { rel: 'apple-touch-icon', href: '/logo192.png' },
      { rel: 'manifest', href: '/manifest.json' },
    ],
  }),

  component: RootComponent,
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function RootComponent() {
  return <Outlet />
}
