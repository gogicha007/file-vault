import {
  createContext,
  useContext,
  useState,
  useEffect,
  PropsWithChildren,
} from 'react'

type User = {
  id: string
  email: string
  name: string | null
  role: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  function getAuthApi() {
    const authApi = window.electronAPI?.auth
    if (!authApi) {
      throw new Error('Electron auth API is not available. Are you running inside Electron?')
    }
    return authApi
  }

  async function checkAuth() {
    try {
      const currentUser = await window.electronAPI?.auth?.getCurrentUser?.()
      if (!currentUser) {
        setUser(null)
        return
      }

      console.log('current user', currentUser)
      setUser(currentUser)
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function login(email: string, password: string) {
    const auth = getAuthApi()
    const user = await auth.login(email, password)
    setUser(user)
  }

  async function register(email: string, password: string, name?: string) {
    const auth = getAuthApi()
    const user = await auth.register(email, password, name)
    setUser(user)
  }

  async function logout() {
    const auth = getAuthApi()
    await auth.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
