export type UserRole = 'REQUESTER' | 'APPROVER'

export type RequestState = 'PENDING' | 'APPROVED' | 'REJECTED'

export type AccessLevel = 'READ' | 'WRITE'

export interface User {
  id: string
  username: string
  password: string
  role: UserRole
  createdAt: string
}

export interface Application {
  id: string
  name: string
  description: string
}

export interface AccessRequest {
  id: string
  appId: string
  level: AccessLevel
  state: RequestState
  createdBy: string
  createdAt: string
  decisionBy: string | null
  decisionAt: string | null
}

export interface RequestFilters {
  requesterId?: string
  level?: AccessLevel
  appId?: string
  state?: RequestState
}

export interface AuthUser {
  id: string
  username: string
  role: UserRole
}
