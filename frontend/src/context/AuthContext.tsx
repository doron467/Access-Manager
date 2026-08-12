import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import * as authService from '../services/authService'
import type { AuthUser } from '../types'
import { AuthContext } from './authContext'


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
