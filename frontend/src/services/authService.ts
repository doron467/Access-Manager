import type { AuthUser } from '../types'
import {
  addUser,
  clearSession,
  findUserByUsername,
  generateId,
  loadSession,
  saveSession,
} from './mockStore'

export function getCurrentUser(): AuthUser | null {
  const session = loadSession()
  if (!session) {
    return null
  }

  const user = findUserByUsername(session.username)
  if (!user) {
    clearSession()
    return null
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role,
  }
}

export function register(
  username: string,
  password: string,
): { user: AuthUser } | { error: string } {
  const trimmedUsername = username.trim()

  if (!trimmedUsername) {
    return { error: 'Username is required.' }
  }

  if (password.length < 4) {
    return { error: 'Password must be at least 4 characters.' }
  }

  if (findUserByUsername(trimmedUsername)) {
    return { error: 'Username is already taken.' }
  }

  const newUser = {
    id: generateId('u'),
    username: trimmedUsername,
    password,
    role: 'REQUESTER' as const,
    createdAt: new Date().toISOString(),
  }

  addUser(newUser)

  const authUser: AuthUser = {
    id: newUser.id,
    username: newUser.username,
    role: newUser.role,
  }

  saveSession(authUser)
  return { user: authUser }
}

export function login(
  username: string,
  password: string,
): { user: AuthUser } | { error: string } {
  const user = findUserByUsername(username.trim())

  if (!user || user.password !== password) {
    return { error: 'Invalid username or password.' }
  }

  const authUser: AuthUser = {
    id: user.id,
    username: user.username,
    role: user.role,
  }

  saveSession(authUser)
  return { user: authUser }
}

export function logout(): void {
  clearSession()
}
