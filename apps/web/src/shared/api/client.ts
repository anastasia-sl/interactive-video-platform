import { env } from '../config/env'
import { authStorage } from '../lib/auth-storage'

export const apiClient = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = authStorage.getToken()

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {})
    }
  })

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(errorBody?.message ?? 'Request failed')
  }

  return response.json() as Promise<T>
}