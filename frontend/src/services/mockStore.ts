import { APPLICATIONS, SEED_REQUESTS, SEED_USERS } from '../data/mockData'
import type { AccessRequest, Application, AuthUser, User } from '../types'

const USERS_KEY = 'access-manager-users'
const REQUESTS_KEY = 'access-manager-requests'
const SESSION_KEY = 'access-manager-session'

interface MockStore {
  users: User[]
  requests: AccessRequest[]
}

function loadStore(): MockStore {
  const storedUsers = localStorage.getItem(USERS_KEY)
  const storedRequests = localStorage.getItem(REQUESTS_KEY)

  return {
    users: storedUsers ? (JSON.parse(storedUsers) as User[]) : [...SEED_USERS],
    requests: storedRequests
      ? (JSON.parse(storedRequests) as AccessRequest[])
      : [...SEED_REQUESTS],
  }
}

function saveStore(store: MockStore): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(store.users))
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(store.requests))
}

let store = loadStore()

function persist(): void {
  saveStore(store)
}

export function getApplications(): Application[] {
  return APPLICATIONS
}

export function getUsers(): User[] {
  return store.users
}

export function getRequests(): AccessRequest[] {
  return store.requests
}

export function findUserByUsername(username: string): User | undefined {
  return store.users.find(
    (user) => user.username.toLowerCase() === username.toLowerCase(),
  )
}

export function findUserById(id: string): User | undefined {
  return store.users.find((user) => user.id === id)
}

export function addUser(user: User): void {
  store.users.push(user)
  persist()
}

export function addRequest(request: AccessRequest): void {
  store.requests.unshift(request)
  persist()
}

export function updateRequest(
  requestId: string,
  updates: Partial<AccessRequest>,
): AccessRequest | undefined {
  const index = store.requests.findIndex((request) => request.id === requestId)
  if (index === -1) {
    return undefined
  }

  store.requests[index] = { ...store.requests[index], ...updates }
  persist()
  return store.requests[index]
}

export function saveSession(user: AuthUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function loadSession(): AuthUser | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}
