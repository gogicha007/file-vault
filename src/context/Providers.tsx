import type { PropsWithChildren } from 'react'
import { ThemeProvider } from './ThemeContext'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useRouter } from '@tanstack/react-router'
import { ApiContextProvider } from './ApiContext'
import { AuthProvider } from './AuthContext'

export type ProvidersProps = PropsWithChildren<{}>

export function Providers({ children }: ProvidersProps) {
  const router = useRouter()
  const queryClient = router.options.context.queryClient

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ApiContextProvider>{children}</ApiContextProvider>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </QueryClientProvider>
  )
}

export default Providers
