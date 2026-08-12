import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type { AuthUser } from '../types'
import * as authService from '../services/authService'


interface AuthContextValue {
  user: AuthUser | null
  loading: boolean

  register: (username: string, password: string) => Promise<string | null>
  login: (username: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
}


const AuthContext = createContext<AuthContextValue | null>(null)


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])


  const register = useCallback(
    async (username: string, password: string) => {
      const result = await authService.register(username, password)

      if ('error' in result) {
        return result.error
      }

      setUser(result.user)
      return null
    },
    [],
  )


  const login = useCallback(
    async (username: string, password: string) => {
      const result = await authService.login(username, password)

      if ('error' in result) {
        return result.error
      }

      setUser(result.user)
      return null
    },
    [],
  )


  const logout = useCallback(
    async () => {
      await authService.logout()
      setUser(null)
    },
    [],
  )


  const value = useMemo(
    () => ({
      user,
      loading,
      register,
      login,
      logout,
    }),
    [user, loading, register, login, logout],
  )


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}


export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}