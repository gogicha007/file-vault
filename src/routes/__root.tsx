import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Header from '@/components/layout/Header'

import appCss from '../styles.css?url'
import { ThemeProvider } from '@/context/ThemeContext'
import { FunctionOnce } from '@/lib/function-once'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { QueryClient } from '@tanstack/react-query'

import '../utils/i18n/i18n'
import { useTranslation } from 'react-i18next'

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
  const { i18n } = useTranslation()
  const locale = i18n.language || 'en'

  const router = useRouter()
  const queryClient = router.options.context.queryClient

  return (
    <html
      lang={locale}
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
        <FunctionOnce>
          {() => {
            try {
              const storageKey = 'color.theme'
              const saved = localStorage.getItem(storageKey)
              const prefersDark = window.matchMedia(
                '(prefers-color-scheme: dark)',
              ).matches
              const shouldDark =
                saved === 'dark' ||
                ((saved === null || saved === 'system') && prefersDark)
              const root = document.documentElement
              root.classList.remove('light', 'dark')
              root.classList.add(shouldDark ? 'dark' : 'light')
              ;(window as any).__SSR_THEME = shouldDark ? 'dark' : 'light'
            } catch {}
          }}
        </FunctionOnce>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <div className="flex justify-center h-screen">
              <div className="flex flex-col w-full max-w-7x1">
                <Header />
                <main>{children}</main>
              </div>
            </div>
          </ThemeProvider>
          <ReactQueryDevtools buttonPosition="bottom-left" />
        </QueryClientProvider>
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
