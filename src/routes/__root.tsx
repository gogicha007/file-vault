import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/footer/Footer'
import Providers from '@/context/Providers'


import '../utils/i18n/i18n'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  beforeLoad: ({ context }) => {
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
          <main className="relative flex flex-grow">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </Providers>
  )
}
