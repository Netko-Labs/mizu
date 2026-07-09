import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { QUERY_STALE_TIME_MS, type QueryProviderProps } from './lib'

// Singleton QueryClient in the browser; a fresh one per SSR request.
let clientQueryClient: QueryClient | undefined

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME_MS,
      },
    },
  })
}

function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient()
  }
  if (!clientQueryClient) {
    clientQueryClient = makeQueryClient()
  }
  return clientQueryClient
}

export function getContext() {
  return {
    queryClient: getQueryClient(),
  }
}

export function Provider({ children, queryClient }: QueryProviderProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
