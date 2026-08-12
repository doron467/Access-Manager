import type {
  AccessLevel,
  AccessRequest,
  AIReview,
  Application,
  RequestFilters,
  RequestState,
} from '../types'
import { apiFetch } from './api'


export async function getApplications(): Promise<Application[]> {
  const response = await apiFetch('/requests/apps')

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.message ?? 'Failed to fetch applications')
  }

  return await response.json()
}


export async function listRequests(
  filters: RequestFilters = {},
): Promise<AccessRequest[]> {
  const params = new URLSearchParams()

  if (filters.requesterId) {
    params.set('requesterId', filters.requesterId)
  }

  if (filters.level) {
    params.set('level', filters.level)
  }

  if (filters.state) {
    params.set('state', filters.state)
  }

  if (filters.appId) {
    params.set('appId', filters.appId)
  }

  const queryString = params.toString()

  const response = await apiFetch(
    `/requests${queryString ? `?${queryString}` : ''}`,
  )

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.message ?? 'Failed to fetch requests')
  }

  return await response.json()
}


export async function createRequest(
  appId: string,
  level: AccessLevel,
  reason: string
): Promise<void> {
  const response = await apiFetch('/requests/create', {
    method: 'POST',
    body: JSON.stringify({
      appId,
      level,
      reason
    }),
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.message ?? 'Failed to create request')
  }
}


export async function decideRequest(
  requestId: string,
  state: Extract<RequestState, 'APPROVED' | 'REJECTED'>,
): Promise<void> {
  const response = await apiFetch(`/requests/${requestId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      state,
    }),
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.message ?? 'Failed to decide request')
  }
}

export async function reviewRequest(requestId: string): Promise<AIReview> {
  const response = await apiFetch(`/ai/requests/${requestId}/review`, {
    method: 'POST',
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.message ?? 'Failed to get AI review')
  }

  return await response.json()
}
