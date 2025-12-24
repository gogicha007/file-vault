import { createIsomorphicFn, createServerFn } from "@tanstack/react-start"
import { getCookie, setCookie } from "@tanstack/react-start/server"
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import enTranslations from "../../locales/en.json"
import kaTranslations from "../../locales/ka.json"

export const resources = {
  en: {
    translation: enTranslations,
  },
  ka: {
    translation: kaTranslations,
  },
} as const

export const defaultNS = "translation"

const COOKIE_NAME = "LOCALE"

i18n
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    // Initialize client language from pre-hydration global if present
    lng:
      typeof window !== 'undefined' && (window as any).__SSR_LNG
        ? ((window as any).__SSR_LNG as 'en' | 'ka')
        : undefined,
    fallbackLng: "en",
    supportedLngs: ["en", "ka"],
    interpolation: { escapeValue: false },
  })

export const setSSRLanguage = createIsomorphicFn().server(async () => {
  const language = getCookie(COOKIE_NAME)
  const lng = language === 'ka' ? 'ka' : 'en'
  await i18n.changeLanguage(lng)
})

export const saveLanguage = createServerFn({ method: 'POST' })
  .inputValidator((lng: 'en' | 'ka') => lng)
  .handler(async ({ data }) => {
    setCookie(COOKIE_NAME, data, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })
  })

// Expose i18n to window for FunctionOnce script
if (typeof window !== 'undefined') {
  ;(window as any).i18n = i18n
}

export default i18n