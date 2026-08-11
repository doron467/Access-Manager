import type {
  AccessLevel,
  AccessRequest,
  AuthUser,
  RequestFilters,
  RequestState,
} from '../types'
import {
  addRequest,
  generateId,
  getApplications,
  getRequests,
  updateRequest,
} from './mockStore'

export { getApplications }

export function listRequests(
  user: AuthUser,
  filters: RequestFilters = {},
): AccessRequest[] {
  let results = getRequests()

  if (user.role === 'REQUESTER') {
    results = results.filter((request) => request.createdBy === user.id)
  } else if (filters.requesterId) {
    results = results.filter(
      (request) => request.createdBy === filters.requesterId,
    )
  }

  if (filters.level) {
    results = results.filter((request) => request.level === filters.level)
  }

  if (filters.state) {
    results = results.filter((request) => request.state === filters.state)
  }

  if (filters.appId) {
    results = results.filter((request) => request.appId === filters.appId)
  }

  return results.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function createRequest(
  user: AuthUser,
  appId: string,
  level: AccessLevel,
): AccessRequest {
  const request: AccessRequest = {
    id: generateId('r'),
    appId,
    level,
    state: 'PENDING',
    createdBy: user.id,
    createdAt: new Date().toISOString(),
    decisionBy: null,
    decisionAt: null,
  }

  addRequest(request)
  return request
}

export function decideRequest(
  user: AuthUser,
  requestId: string,
  state: Extract<RequestState, 'APPROVED' | 'REJECTED'>,
): AccessRequest | { error: string } {
  const existing = getRequests().find((request) => request.id === requestId)

  if (!existing) {
    return { error: 'Request not found.' }
  }

  if (existing.state !== 'PENDING') {
    return { error: 'This request has already been decided.' }
  }

  const updated = updateRequest(requestId, {
    state,
    decisionBy: user.id,
    decisionAt: new Date().toISOString(),
  })

  if (!updated) {
    return { error: 'Failed to update request.' }
  }

  return updated
}
