import { createFileRoute } from '@tanstack/react-router'
import Settings from '@/features/settings/Settings'

export const Route = createFileRoute('/settings')({
  ssr: false,
  component: RouteComponent,
})

function RouteComponent() {
  return <Settings />
}
