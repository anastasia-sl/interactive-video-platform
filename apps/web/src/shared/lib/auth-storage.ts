import {
  clearAccessToken,
  getAccessToken,
  setAccessToken
} from '../../features/auth/lib/accessToken'

export const authStorage = {
  getToken(): string | null {
    return getAccessToken()
  },
  setToken(token: string) {
    setAccessToken(token)
  },
  clearToken() {
    clearAccessToken()
  }
}