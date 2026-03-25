import { VisitLogo } from '@/components/logo/VisitLogo'

const Footer = () => {
  const handleVisitClick = () => {
    try {
      window.electron.invoke('open-external', 'https://visit.ge')
      return
    } catch {}

    window.open('https://visit.ge', '_blank', 'noopener,noreferrer')
  }

  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="conatiner py-8">
        <button
          type="button"
          onClick={handleVisitClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <VisitLogo className="h-6" style={{ color: 'var(--primary)' }} />
        </button>
      </div>
    </footer>
  )
}

export default Footer
