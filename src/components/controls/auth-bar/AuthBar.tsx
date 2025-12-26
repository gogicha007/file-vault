import { Button } from '../../ui/button'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from '@tanstack/react-router'

const AuthBar = () => {
  const { t: tAB } = useTranslation('translation', { keyPrefix: 'AuthBar' })
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (user) {
    return (
      <div className="flex items-center gap-2 ml-2">
        <span className="text-sm">{user.name || user.email}</span>
        <Button variant="ghost" size="sm" onClick={logout}>
          <span suppressHydrationWarning>Logout</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 ml-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: '/login' })}
      >
        <span suppressHydrationWarning>{tAB('signin')}</span>
      </Button>
      <Button
        onClick={()=> navigate({to: '/register'})}
        size="sm"
        className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
      >
        <span suppressHydrationWarning>{tAB('signup')}</span>
      </Button>
    </div>
  )
}

export default AuthBar
