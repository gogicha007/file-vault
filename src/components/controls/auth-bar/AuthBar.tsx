import { Button } from '../../ui/button'
import { useTranslation } from 'react-i18next'

const AuthBar = () => {
  const { t: tAB } = useTranslation('translation', { keyPrefix: 'AuthBar' })
  const onClickLogin = () => {
    alert('ფუნქცია ჯერ არ მუშაობს')
  }
  const onClickSignUp = () => {
    alert('ფუნქცია ჯერ არ მუშაობს')
  }
  return (
    <div className="flex items-center gap-2 ml-2">
      <Button variant="ghost" size="sm" onClick={onClickLogin}>
        <span suppressHydrationWarning>{tAB('signin')}</span>
      </Button>
      <Button
        onClick={onClickSignUp}
        size="sm"
        className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
      >
        <span suppressHydrationWarning>{tAB('signup')}</span>
      </Button>
    </div>
  )
}

export default AuthBar
