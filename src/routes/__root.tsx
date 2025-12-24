import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Header from '@/components/layout/Header'

import appCss from '../styles.css?url'
import { ThemeProvider } from '@/context/ThemeContext'
import { FunctionOnce } from '@/lib/function-once'

import '../utils/i18n/i18n'
import { setSSRLanguage } from '../utils/i18n/i18n'
import { useTranslation } from 'react-i18next'

export const Route = createRootRoute({
  beforeLoad: async () => {
    await setSSRLanguage()
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
            const COOKIE_NAME = 'LOCALE'
            const cookieHeader = document.cookie || ''
            const pairs = cookieHeader ? cookieHeader.split('; ') : []
            let locale = 'en'
            for (const c of pairs) {
              const [key, ...rest] = c.split('=')
              if (key === COOKIE_NAME) {
                locale = rest.join('=') || 'en'
                break
              }
            }
            ;(window as any).__SSR_LNG = locale

            // Set initial theme before hydration to avoid attribute mismatch
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
        <ThemeProvider>
          <Header />
          {children}
        </ThemeProvider>
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
