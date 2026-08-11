import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthUser } from '../types'
import * as authService from '../services/authService'

interface AuthContextValue {
  user: AuthUser | null
  register: (username: string, password: string) => string | null
  login: (username: string, password: string) => string | null
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    authService.getCurrentUser(),
  )

  const register = useCallback((username: string, password: string) => {
    const result = authService.register(username, password)
    if ('error' in result) {
      return result.error
    }

    setUser(result.user)
    return null
  }, [])

  const login = useCallback((username: string, password: string) => {
    const result = authService.login(username, password)
    if ('error' in result) {
      return result.error
    }

    setUser(result.user)
    return null
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, register, login, logout }),
    [user, register, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
