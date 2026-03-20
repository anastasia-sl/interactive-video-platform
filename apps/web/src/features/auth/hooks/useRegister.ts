import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/auth.api'
import { authStorage } from '../../../shared/lib/auth-storage'

export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      authStorage.setToken(data.accessToken)
    }
  })
}