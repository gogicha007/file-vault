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
const isBrowser = typeof window !== 'undefined'

function getInitialLng(): 'en' | 'ka' {
  const saved =
    typeof localStorage !== 'undefined'
      ? (localStorage.getItem(STORAGE_KEY) as 'en' | 'ka' | null)
      : null

  if (saved === 'ka') return 'ka'
  if (saved === 'en') return 'en'
  const nav =
    typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'en'

  return nav.startsWith('ka') ? 'ka' : 'en'
}

const lng = isBrowser ? getInitialLng() : 'en'
i18n.use(initReactI18next).init({
  resources,
  defaultNS,
  lng,
  supportedLngs: ['en', 'ka'],
  interpolation: { escapeValue: false },
})

export async function setLanguage(lng: 'en' | 'ka') {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lng)
  }
  await i18n.changeLanguage(lng)
}


export default i18n