import { createMemoryHistory, createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {
  const queryClient = new QueryClient()

  // In the packaged Electron app we load via file://...
  // which produces a pathname like /C:/.../index.html that won't match our routes.
  // Use memory history starting at '/' so the Home route renders on startup.
  const isFileProtocol =
    typeof window !== 'undefined' && window.location.protocol === 'file:'

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    ...(isFileProtocol
      ? { history: createMemoryHistory({ initialEntries: ['/'] }) }
      : {}),
  })

  return router
}
