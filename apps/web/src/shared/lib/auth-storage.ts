const ACCESS_TOKEN_KEY = 'ivp_access_token'

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },
  setToken(token: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  },
  clearToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  }
}