import { useTranslation } from 'react-i18next'
import { useTransition } from 'react'
import { Button } from '../../ui/button'
import { Globe } from 'lucide-react'
import { saveLanguage } from '@/utils/i18n/i18n'

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

  const [isPending, startTransition] = useTransition()

  const locale = normalizeLang(i18n.language || 'en')

  const setLanguage = async (newLang: 'en' | 'ka') => {
    startTransition(async () => {
      await i18n.changeLanguage(newLang)
      await saveLanguage({ data: newLang })
    })
  }
  const handleChange = () => {
    console.log(locale)
    startTransition(() => {
      setLanguage(locale === 'en' ? 'ka' : 'en')
    })
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
        <span className="ml-1 text-xs font-medium">
          {LANG_META[locale].label}
        </span>
      </Button>
    </>
  )
}
