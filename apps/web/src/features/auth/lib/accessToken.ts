const AUTH_CHANGED_EVENT = 'auth-changed'
const ACCESS_TOKEN_KEY = 'ivp_access_token'

export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export const setAccessToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

export const clearAccessToken = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

export const subscribeToAuthChanges = (callback: () => void): (() => void) => {
  const handleChange = (): void => callback()

  window.addEventListener('storage', handleChange)
  window.addEventListener(AUTH_CHANGED_EVENT, handleChange)

  return (): void => {
    window.removeEventListener('storage', handleChange)
    window.removeEventListener(AUTH_CHANGED_EVENT, handleChange)
  }
}