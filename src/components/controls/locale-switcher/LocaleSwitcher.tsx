import { useTranslation } from 'react-i18next'
import { useTransition } from 'react'
import { Button } from '../../ui/button'
import { Globe } from 'lucide-react'
import { setLanguage } from '@/utils/i18n/i18n'

type LangCode = 'en' | 'ka'

function normalizeLang(code: string): LangCode {
  const short = code.toLowerCase().slice(0, 2)
  return short === 'ka' ? 'ka' : 'en'
}

const LANG_META: Record<
  LangCode,
  { code: LangCode; label: string; flag: string }
> = {
  en: { code: 'en', label: 'English', flag: '🇬🇧' },
  ka: { code: 'ka', label: 'ქართული', flag: '🇬🇪' },
}

export default function LocaleSwitcher() {
  const { i18n } = useTranslation()

  const [isPending] = useTransition()

  const locale = normalizeLang(i18n.language || 'en')

  const changeLanguage = async (newLang: 'en' | 'ka') => {
    await setLanguage(newLang)
  }
  const handleChange = () => {
    void changeLanguage(locale === 'en' ? 'ka' : 'en')
  }

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => handleChange()}
        title="Change language"
        className={`${isPending ? 'pointer-events-none' : 'cursor-pointer'}`}
      >
        <Globe className="h-4 w-4" />
        <span className="ml-1 text-xs font-medium" suppressHydrationWarning>
          {LANG_META[locale].label}
        </span>
      </Button>
    </>
  )
}
