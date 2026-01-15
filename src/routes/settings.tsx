import { createFileRoute } from '@tanstack/react-router'
import Settings from '@/features/settings/Settings'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/settings')({
  ssr: false,
  component: () => {
    const { user } = useAuth()
    const { t: tSS } = useTranslation('translation', {
      keyPrefix: 'Settings',
    })

    if (!user) {
      return (
        <div className="max-w-4xl mx-auto mt-4 space-y-8">
          <h1>{tSS("unauthorized")}</h1>
        </div>
      )
    }
    return SettingsPage()
  },
})

function SettingsPage() {
  return <Settings />
}
