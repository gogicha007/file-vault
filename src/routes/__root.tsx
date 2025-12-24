import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Header from '@/components/layout/Header'

import appCss from '../styles.css?url'
import Providers from '@/context/Providers'

import type { QueryClient } from '@tanstack/react-query'

import '../utils/i18n/i18n'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  ssr: false,
  beforeLoad: async ({ context }) => {
    context.queryClient.setDefaultOptions({
      queries: { staleTime: 60_000 },
    })
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'File Vault',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  notFoundComponent: () => {
    return <p>page not found</p>
  },

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={"en"}
      className={
        typeof window !== 'undefined' && (window as any).__SSR_THEME
          ? ((window as any).__SSR_THEME as 'dark' | 'light')
          : undefined
      }
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
      </head>
      <body className={`antialiased`}>
        {/* Theme pre-hydration handled in ThemeProvider's FunctionOnce */}
        <Providers>
          <div className="flex justify-center h-screen">
            <div className="flex flex-col w-full max-w-7x1">
              <Header />
              <main>{children}</main>
            </div>
          </div>
        </Providers>
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
        <Scripts />
      </body>
    </html>
  )
}
