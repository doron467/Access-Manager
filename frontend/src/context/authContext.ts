import { createContext } from 'react'
import type { AuthUser } from '../types'

export interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  register: (username: string, password: string) => Promise<string | null>
  login: (username: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
