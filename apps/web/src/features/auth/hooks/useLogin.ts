import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/auth.api'
import { authStorage } from '../../../shared/lib/auth-storage'

export const useLogin = () => {
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      authStorage.setToken(data.accessToken)
    }
  })
}