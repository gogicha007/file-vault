import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'
import { ThemeProvider } from './ThemeContext'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useRouter } from '@tanstack/react-router'
import i18n, { initI18n } from '@/utils/i18n/i18n'
import { I18nextProvider } from 'react-i18next'

export type ProvidersProps = PropsWithChildren<{}>

export function Providers({ children }: ProvidersProps) {
  const router = useRouter()
  const queryClient = router.options.context.queryClient

  useEffect(() => {
    initI18n()
    const applyLang = () => {
      try {
        document.documentElement.lang = i18n.language || 'en'
      } catch {}
    }
    applyLang()
    i18n.on('languageChanged', applyLang)
    return () => {
      i18n.off('languageChanged', applyLang)
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>{children}</ThemeProvider>
      </I18nextProvider>
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </QueryClientProvider>
  )
}

export default Providers
