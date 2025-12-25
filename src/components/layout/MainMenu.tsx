import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

const MainMenu = () => {
  const { t: tM } = useTranslation('translation', { keyPrefix: 'MainMenu' })
  const menuItems = [
    { label: tM('title'), href: '/' },
    { label: tM('settings'), href: '/settings' },
  ]

  return (
    <nav className="hidden md:flex items-center gap-6">
      {menuItems.map((item, idx) => (
        <Link
          key={idx}
          to={item.href}
          className="text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          <span >{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}

export default MainMenu
