import { createFileRoute } from '@tanstack/react-router'
import Settings from '@/features/settings/Settings'

export const Route = createFileRoute('/settings')({
  ssr: false,
  component: () => {
    const open = true
    if (!open) {
      console.log('not authenticated')
    }
    console.log('authenticated')
    return SettingsPage()
  },
})

function SettingsPage() {
  return <Settings />
}
