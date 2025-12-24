import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslations from '../../locales/en.json'
import kaTranslations from '../../locales/ka.json'

export const resources = {
  en: { translation: enTranslations },
  ka: { translation: kaTranslations },
} as const

export const defaultNS = 'translation'

const STORAGE_KEY = 'LOCALE'
const COOKIE_NAME = 'LOCALE'
const isBrowser = typeof window !== 'undefined'

function readCookie(name: string) {
  if (typeof document === 'undefined') return null
  const cookieHeader = document.cookie || ''
  const pairs = cookieHeader ? cookieHeader.split('; ') : []
  for (const c of pairs) {
    const [key, ...rest] = c.split('=')
    if (key === name) {
      const raw = rest.join('=') || ''
      try {
        return decodeURIComponent(raw)
      } catch {
        return raw || null
      }
    }
  }
  return null
}

function writeCookie(name: string, value: string) {
  if (typeof document === 'undefined') return
  const encoded = encodeURIComponent(value)
  const base = `${name}=${encoded}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
  const isSecure = typeof location !== 'undefined' && location.protocol === 'https:'
  document.cookie = isSecure ? `${base}; secure` : base
}

function getInitialLng(): 'en' | 'ka' {
  const saved =
    typeof localStorage !== 'undefined'
      ? (localStorage.getItem(STORAGE_KEY) as 'en' | 'ka' | null)
      : null
  const cookieSaved = readCookie(COOKIE_NAME) as 'en' | 'ka' | null

  if (saved === 'ka' || cookieSaved === 'ka') return 'ka'
  if (saved === 'en' || cookieSaved === 'en') return 'en'
  // fallback to browser
  const nav =
    typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'en'

  console.log('local storage', saved)
  return nav.startsWith('ka') ? 'ka' : 'en'
}

let initialized = false
export function initI18n(initialLng?: 'en' | 'ka') {
  if (initialized) return
  const lng = initialLng ?? (isBrowser ? getInitialLng() : 'en')
  i18n.use(initReactI18next).init({
    resources,
    defaultNS,
    lng,
    fallbackLng: 'en',
    supportedLngs: ['en', 'ka'],
    interpolation: { escapeValue: false },
  })
  initialized = true
}

// Initialize in all environments; on server it uses a safe default ('en')
initI18n()

export async function setLanguage(lng: 'en' | 'ka') {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lng)
  }
  writeCookie(COOKIE_NAME, lng)
  await i18n.changeLanguage(lng)
}

// Expose i18n for debugging if needed
if (typeof window !== 'undefined') {
  ;(window as any).i18n = i18n
}

export default i18n