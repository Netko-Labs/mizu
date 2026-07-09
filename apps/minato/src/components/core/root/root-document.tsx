import { HeadContent, Scripts } from '@tanstack/react-router'
import * as TanstackQuery from '@/integrations/tanstack-query'

export function RootDocument({ children }: { children: React.ReactNode }) {
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
