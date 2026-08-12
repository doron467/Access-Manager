import type { Application } from '../types'
import { apiFetch } from './api'

export async function getApplications(): Promise<Application[]> {
  const response = await apiFetch('/requests/apps')

  if (!response.ok) {
    const data = await response.json()

    throw new Error(data.message ?? 'Failed to fetch applications')
  }

  return await response.json()
}