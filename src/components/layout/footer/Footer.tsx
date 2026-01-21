import { VisitLogo } from '@/components/logo/VisitLogo'

const Footer = () => {
  const handleVisitClick = () => {
    try {
      if (window.electron?.invoke) {
        window.electron.invoke('open-external', 'https://visit.ge')
        return
      }
    } catch {
      // fall back to window.open below
    }

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
          <VisitLogo style={{ color: 'var(--primary)' }} />
        </button>
      </div>
    </footer>
  )
}

export default Footer
