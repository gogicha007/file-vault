import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Header from '@/components/layout/Header'
import Providers from '@/context/Providers'

import type { QueryClient } from '@tanstack/react-query'

import '../utils/i18n/i18n'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  beforeLoad: async ({ context }) => {
    context.queryClient.setDefaultOptions({
      queries: { staleTime: 60_000 },
    })
  },
  notFoundComponent: () => {
    return <p>page not found</p>
  },
  component: RootComponent,
})

function RootComponent() {
  return (
    <Providers>
      <div className="flex justify-center h-screen">
        <div className="flex flex-col w-full max-w-6xl">
          <Header />
          <main>
            <Outlet />
          </main>
        </div>
      </div>
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </Providers>
  )
}
