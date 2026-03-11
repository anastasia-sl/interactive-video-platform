import { useQuery } from '@tanstack/react-query'
import { authApi } from '../api/auth.api'
import { authStorage } from '../../../shared/lib/auth-storage'

export const useMe = () => {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    enabled: Boolean(authStorage.getToken()),
    retry: false
  })
}