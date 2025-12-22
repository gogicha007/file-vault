import { createIsomorphicFn } from "@tanstack/react-start"
import { getCookie } from "@tanstack/react-start/server"
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import enTranslations from "../../locales/en.json"
import kaTranslations from "../../locales/ka.json"

export const resources = {
  en: {
    translation: enTranslations,
  },
  it: {
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
    fallbackLng: "en",
    supportedLngs: ["en", "ka"],
    detection: {
      order: ["cookie"],
      lookupCookie: COOKIE_NAME,
      caches: ["cookie"],
      cookieMinutes: 60 * 24 * 365,
    },
    interpolation: { escapeValue: false },
  })

export const setSSRLanguage = createIsomorphicFn().server(async () => {
  const language = getCookie(COOKIE_NAME)
  await i18n.changeLanguage(language || "en")
})

export default i18n