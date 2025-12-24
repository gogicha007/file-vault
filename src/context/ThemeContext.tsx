import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { FunctionOnce } from '../lib/function-once'

export type ResolvedTheme = 'dark' | 'light'
export type Theme = ResolvedTheme | 'system'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

interface ThemeProviderState {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

const isBrowser = typeof window !== 'undefined'

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'color.theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (!isBrowser) return defaultTheme
    const saved = localStorage.getItem(storageKey) as Theme | null
    return saved === 'dark' || saved === 'light' || saved === 'system'
      ? saved
      : defaultTheme
  })

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')

  useEffect(() => {
    const root = window.document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    function updateTheme() {
      root.classList.remove('light', 'dark')

      if (theme === 'system') {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light'
        setResolvedTheme(systemTheme)
        root.classList.add(systemTheme)
        return
      }

      setResolvedTheme(theme as ResolvedTheme)
      root.classList.add(theme)
    }

    mediaQuery.addEventListener('change', updateTheme)
    updateTheme()

    return () => mediaQuery.removeEventListener('change', updateTheme)
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (theme: Theme) => {
        localStorage.setItem(storageKey, theme)
        setTheme(theme)
      },
    }),
    [theme, resolvedTheme, storageKey],
  )

  return (
    <ThemeProviderContext value={value}>
      <FunctionOnce param={storageKey}>
        {(storageKey) => {
          const saved = localStorage.getItem(storageKey)
          const prefersDark = window.matchMedia(
            '(prefers-color-scheme: dark)'
          ).matches
          const shouldDark =
            saved === 'dark' ||
            ((saved === null || saved === 'system') && prefersDark)
          const root = document.documentElement
          root.classList.remove('light', 'dark')
          root.classList.add(shouldDark ? 'dark' : 'light')
          ;(window as any).__SSR_THEME = shouldDark ? 'dark' : 'light'
        }}
      </FunctionOnce>
      {children}
    </ThemeProviderContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
