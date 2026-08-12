import type { AuthUser } from '../types'
import { apiFetch, setAccessToken } from './api'


export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await apiFetch('/auth/me')

  if (!response.ok) {
    return null
  }

  return await response.json()
}


export async function register(
  username: string,
  password: string,
): Promise<{ user: AuthUser } | { error: string }> {
  const trimmedUsername = username.trim()

  if (!trimmedUsername) {
    return { error: 'Username is required.' }
  }

  if (password.length < 4) {
    return { error: 'Password must be at least 4 characters.' }
  }

  const response = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: trimmedUsername,
      password,
    }),
  })

  if (!response.ok) {
    const data = await response.json()
    return { error: data.message ?? 'Registration failed.' }
  }

  const data = await response.json()

  setAccessToken(data.accessToken)

  return {
    user: data.userInfo,
  }
}


export async function login(
  username: string,
  password: string,
): Promise<{ user: AuthUser } | { error: string }> {
  const trimmedUsername = username.trim()

  if (!trimmedUsername) {
    return { error: 'Username is required.' }
  }

  if (!password) {
    return { error: 'Password is required.' }
  }

  const response = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      name: trimmedUsername,
      password,
    }),
  })

  if (!response.ok) {
    const data = await response.json()
    return { error: data.message ?? 'Invalid username or password.' }
  }

  const data = await response.json()

  setAccessToken(data.accessToken)

  return {
    user: data.userInfo,
  }
}


export async function logout(): Promise<void> {
  await apiFetch('/auth/logout', {
    method: 'POST',
  })

  setAccessToken(null)
}