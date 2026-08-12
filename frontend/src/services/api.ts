const API_URL = import.meta.env.VITE_API_URL

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

async function refreshAccessToken(): Promise<boolean> {
  const response = await fetch(
    `${API_URL}/auth/refresh-token`,
    {
      method: 'POST',
      credentials: 'include',
    }
  )

  if (!response.ok) {
    accessToken = null
    return false
  }

  const data = await response.json()

  accessToken = data.accessToken

  return true
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers)

  headers.set('Content-Type', 'application/json')

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  let response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (response.status === 401) {
    const refreshed = await refreshAccessToken()

    if (!refreshed) {
      return response
    }

    headers.set('Authorization', `Bearer ${accessToken}`)

    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    })
  }

  return response
}