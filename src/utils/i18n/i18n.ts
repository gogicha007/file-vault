import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslations from '../../locales/en.json'
import kaTranslations from '../../locales/ka.json'

export const resources = {
  en: { translation: enTranslations },
  ka: { translation: kaTranslations },
} as const

export const defaultNS = 'translation'

const COOKIE_NAME = 'LOCALE'

function readCookie(name: string) {
  if (typeof document === 'undefined') return null
  const cookieHeader = document.cookie || ''
  const pairs = cookieHeader ? cookieHeader.split('; ') : []
  for (const c of pairs) {
    const [key, ...rest] = c.split('=')
    if (key === name) return rest.join('=') || null
  }
  return null
}

function writeCookie(name: string, value: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 365}`
}

function getInitialLng(): 'en' | 'ka' {
  const saved =
    (typeof localStorage !== 'undefined' &&
      (localStorage.getItem(COOKIE_NAME) as 'en' | 'ka' | null)) ||
    (readCookie(COOKIE_NAME) as 'en' | 'ka' | null)

  if (saved === 'ka') return 'ka'
  if (saved === 'en') return 'en'
  // fallback to browser
  const nav =
    typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'en'
  return nav.startsWith('ka') ? 'ka' : 'en'
}

i18n.use(initReactI18next).init({
  resources,
  defaultNS,
  lng: getInitialLng(),
  fallbackLng: 'en',
  supportedLngs: ['en', 'ka'],
  interpolation: { escapeValue: false },
})

export async function setLanguage(lng: 'en' | 'ka') {
  writeCookie(COOKIE_NAME, lng)
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(COOKIE_NAME, lng)
  }
  await i18n.changeLanguage(lng)
}

// Expose i18n for debugging if needed
if (typeof window !== 'undefined') {
  ;(window as any).i18n = i18n
}

export default i18n