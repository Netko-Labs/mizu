import type { QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import * as TanstackQuery from '@/integrations/tanstack-query'

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

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black font-mono">
      <div className="mx-auto w-full max-w-sm">
        <div className="rounded-lg border border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-2.5">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
              <div className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
              <div className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
            </div>
            <span className="text-[11px] text-neutral-600">error.log</span>
          </div>
          <div className="space-y-3 p-6">
            <div className="text-4xl font-bold text-white">404</div>
            <div className="space-y-1">
              <div className="text-xs text-neutral-600">
                $ curl --head <span className="text-neutral-500">current_page</span>
              </div>
              <div className="text-xs text-red-500">▸ error: route not found</div>
            </div>
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-black px-4 py-2 text-xs text-neutral-400 transition-all hover:border-neutral-700 hover:text-white"
            >
              $ cd ~
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const rqContext = TanstackQuery.getContext()

  return (
    <TanstackQuery.Provider {...rqContext}>
      <html lang="en" className="dark">
        <head>
          <HeadContent />
        </head>
        <body>
          {children}
          <Scripts />
        </body>
      </html>
    </TanstackQuery.Provider>
  )
}
