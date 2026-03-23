import { useEffect, useState } from 'react'
import {
  getAccessToken,
  subscribeToAuthChanges
} from '../lib/accessToken'

export const useAuth = () => {
  const [accessToken, setAccessTokenState] = useState<string | null>(() => getAccessToken())

  useEffect(() => {
    return subscribeToAuthChanges(() => {
      setAccessTokenState(getAccessToken())
    })
  }, [])

  return {
    accessToken,
    isAuthenticated: Boolean(accessToken)
  }
}