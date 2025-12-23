import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Header from '@/components/layout/Header'

import appCss from '../styles.css?url'
import { ThemeProvider } from '@/context/ThemeContext'

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
    <html lang={locale}>
      <head>
        <HeadContent />
      </head>
      <body className={`antialiased`}>
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
